import React, {
    createContext, useCallback, useContext, useEffect,
    useRef, useState,
} from 'react';
import { useSocket } from './SocketContext';
import { callEventBus } from './callEventBus';

// ── Types ──────────────────────────────────────────────────────────────────
export type CallStatus = 'idle' | 'ringing' | 'calling' | 'active';
export type CallType = 'audio' | 'video';

export interface IncomingCallInfo {
    callerSocketId: string;
    callerName: string;
    roomId: string;
    callType: CallType;
}

interface CallContextValue {
    callStatus: CallStatus;
    callType: CallType | null;
    callRoomId: string | null;
    incomingCall: IncomingCallInfo | null;
    localStream: MediaStream | null;
    remoteStreams: Record<string, { stream: MediaStream; name: string }>;
    isMuted: boolean;
    isCameraOff: boolean;
    isScreenSharing: boolean;
    mediaError: string | null;
    startCall: (roomId: string, type: CallType) => void;
    acceptCall: () => void;
    declineCall: () => void;
    endCall: () => void;
    toggleMic: () => void;
    toggleCamera: () => void;
    toggleScreenShare: () => void;
}

const CallContext = createContext<CallContextValue | null>(null);

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // TURN servers — required for mobile networks (carrier-grade NAT)
        {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject',
        },
        {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject',
        },
        {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject',
        },
    ],
};

// ── Provider ────────────────────────────────────────────────────────────────
export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { socket } = useSocket();

    const [callStatus, setCallStatus] = useState<CallStatus>('idle');
    const [callType, setCallType] = useState<CallType | null>(null);
    const [callRoomId, setCallRoomId] = useState<string | null>(null);
    const [incomingCall, setIncomingCall] = useState<IncomingCallInfo | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<Record<string, { stream: MediaStream; name: string }>>({});
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [mediaError, setMediaError] = useState<string | null>(null);

    const peersRef = useRef<Record<string, RTCPeerConnection>>({});
    const localRef = useRef<MediaStream | null>(null);
    const screenStream = useRef<MediaStream | null>(null);
    const callStartRef = useRef<string | null>(null); // ISO timestamp when call started
    // ICE candidates that arrive before setRemoteDescription completes are queued here
    const iceCandidateQueue = useRef<Record<string, RTCIceCandidateInit[]>>({});

    // ── Media helpers ──────────────────────────────────────────────────────
    const getMedia = useCallback(async (type: CallType): Promise<MediaStream> => {
        setMediaError(null);

        // Stop any leftover tracks — Windows can report "Could not start audio source"
        // if a previous getUserMedia call left tracks open
        localRef.current?.getTracks().forEach(t => t.stop());
        localRef.current = null;

        // Relaxed audio constraints bypass Windows driver issues more reliably
        const relaxedAudio = { echoCancellation: false, noiseSuppression: false, autoGainControl: false };

        const attempts: MediaStreamConstraints[] = [
            // 1. Ideal: both audio + video with relaxed audio
            ...(type === 'video' ? [{ audio: relaxedAudio, video: { width: 640, height: 480 } }] : []),
            // 2. Audio + video with plain true constraints
            ...(type === 'video' ? [{ audio: true, video: true }] : []),
            // 3. Audio only with relaxed constraints (video call fallback or audio call)
            { audio: relaxedAudio, video: false },
            // 4. Most basic — browser decides everything
            { audio: true, video: false },
        ];

        for (const constraints of attempts) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                localRef.current = stream;
                setLocalStream(stream);
                return stream;
            } catch (err) {
                console.warn('[getMedia] attempt failed with', JSON.stringify(constraints), err);
            }
        }

        const msg = 'Microphone unavailable. Fix: (1) Close Discord/Teams/Zoom — they lock the mic, (2) Open services.msc → restart "Windows Audio", (3) Check Windows Settings → Privacy → Microphone → allow browser apps';
        setMediaError(msg);
        throw new Error(msg);
    }, []);

    const cleanup = useCallback(() => {
        // Close all peer connections
        Object.values(peersRef.current).forEach(pc => pc.close());
        peersRef.current = {};
        iceCandidateQueue.current = {};

        // Stop local tracks
        localRef.current?.getTracks().forEach(t => t.stop());
        localRef.current = null;
        screenStream.current?.getTracks().forEach(t => t.stop());
        screenStream.current = null;

        setLocalStream(null);
        setRemoteStreams({});
        setCallStatus('idle');
        setCallType(null);
        setCallRoomId(null);
        setIncomingCall(null);
        setIsMuted(false);
        setIsCameraOff(false);
        setIsScreenSharing(false);
    }, []);

    // ── Create a peer connection for a given remote socket ─────────────────
    const createPeer = useCallback((
        remoteSocketId: string,
        remoteName: string,
        stream: MediaStream | null,
        isInitiator: boolean,
    ): RTCPeerConnection => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        // Add local tracks only when media is available (stream can be null when
        // mic/camera access fails — call proceeds in receive-only mode)
        if (stream) {
            stream.getTracks().forEach(t => pc.addTrack(t, stream));
        }

        // ICE candidates → relay via socket
        pc.onicecandidate = (e) => {
            if (e.candidate && socket) {
                socket.emit('callSignal', {
                    targetSocketId: remoteSocketId,
                    signal: { type: 'ice', candidate: e.candidate },
                });
            }
        };

        // Remote tracks — build stream from individual tracks so e.streams[0] being
        // empty (Firefox, mobile WebKit) doesn't break audio/video delivery.
        const remoteStream = new MediaStream();
        pc.ontrack = (e) => {
            remoteStream.addTrack(e.track);
            setRemoteStreams(prev => ({
                ...prev,
                [remoteSocketId]: { stream: remoteStream, name: remoteName },
            }));
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                setRemoteStreams(prev => {
                    const next = { ...prev };
                    delete next[remoteSocketId];
                    return next;
                });
            }
        };

        peersRef.current[remoteSocketId] = pc;

        if (isInitiator) {
            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                    socket?.emit('callSignal', {
                        targetSocketId: remoteSocketId,
                        signal: { type: 'offer', sdp: pc.localDescription },
                    });
                })
                .catch(console.error);
        }

        return pc;
    }, [socket]);

    // ── Socket event handlers ──────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;

        const handleIncomingCall = (info: IncomingCallInfo) => {
            setMediaError(null); // clear any stale error from a previous failed outgoing attempt
            setIncomingCall(info);
            setCallStatus('ringing');
        };

        // Caller: someone accepted → create peer and initiate offer
        const handleCallAccepted = async ({ accepterSocketId, accepterName }: { accepterSocketId: string; accepterName: string }) => {
            setCallStatus('active');
            // Use already-acquired stream; don't retry getMedia (it already failed or succeeded in startCall)
            createPeer(accepterSocketId, accepterName, localRef.current, true);
        };

        const handleCallDeclined = ({ declinerName }: { declinerName: string }) => {
            console.log(`${declinerName} declined the call`);
            // If no active peers, return to idle
            if (Object.keys(peersRef.current).length === 0) {
                cleanup();
            }
        };

        // SDP / ICE signal relay
        const handleCallSignal = async ({ fromSocketId, fromName, signal }: {
            fromSocketId: string; fromName: string; signal: { type: string; sdp?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit };
        }) => {
            let pc = peersRef.current[fromSocketId];

            if (signal.type === 'offer') {
                if (!pc) {
                    // Callee receiving offer — create peer (non-initiator); stream may be null
                    pc = createPeer(fromSocketId, fromName, localRef.current, false);
                }
                await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp!));
                // Flush ICE candidates that arrived while setRemoteDescription was pending
                const queued = iceCandidateQueue.current[fromSocketId] ?? [];
                delete iceCandidateQueue.current[fromSocketId];
                for (const c of queued) {
                    await pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.warn);
                }
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('callSignal', {
                    targetSocketId: fromSocketId,
                    signal: { type: 'answer', sdp: pc.localDescription },
                });
                setCallStatus('active');
            } else if (signal.type === 'answer' && pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp!));
                // Flush ICE candidates that arrived while setRemoteDescription was pending
                const queued = iceCandidateQueue.current[fromSocketId] ?? [];
                delete iceCandidateQueue.current[fromSocketId];
                for (const c of queued) {
                    await pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.warn);
                }
            } else if (signal.type === 'ice') {
                if (pc && pc.remoteDescription) {
                    await pc.addIceCandidate(new RTCIceCandidate(signal.candidate!)).catch(console.warn);
                } else {
                    // Queue — setRemoteDescription hasn't completed yet (async yield window)
                    if (!iceCandidateQueue.current[fromSocketId]) {
                        iceCandidateQueue.current[fromSocketId] = [];
                    }
                    iceCandidateQueue.current[fromSocketId].push(signal.candidate!);
                }
            }
        };

        const handleCallEnded = () => {
            cleanup();
        };

        socket.on('incomingCall', handleIncomingCall);
        socket.on('callAccepted', handleCallAccepted);
        socket.on('callDeclined', handleCallDeclined);
        socket.on('callSignal', handleCallSignal);
        socket.on('callEnded', handleCallEnded);

        return () => {
            socket.off('incomingCall', handleIncomingCall);
            socket.off('callAccepted', handleCallAccepted);
            socket.off('callDeclined', handleCallDeclined);
            socket.off('callSignal', handleCallSignal);
            socket.off('callEnded', handleCallEnded);
        };
    }, [socket, callType, createPeer, cleanup, getMedia]);

    // ── Public actions ─────────────────────────────────────────────────────
    const startCall = useCallback(async (roomId: string, type: CallType) => {
        // Try to get media but don't block the call if it fails — the user
        // can still participate in receive-only mode.
        try {
            await getMedia(type);
        } catch (err) {
            console.warn('Media access failed, proceeding without local stream:', err);
        }
        setCallType(type);
        setCallRoomId(roomId);
        setCallStatus('calling');
        const startedAt = new Date().toISOString();
        callStartRef.current = startedAt;
        socket?.emit('callUser', { roomId, callType: type });
        const startEvent = {
            id: `cl-local-${Date.now()}`,
            logType: 'started' as const,
            callType: type,
            initiatorName: 'You',
            startedAt,
            timestamp: startedAt,
            roomId,
        };
        callEventBus.emit(startEvent);
        socket?.emit('callLog', {
            roomId,
            logType: 'started',
            callType: type,
            startedAt,
        });
    }, [socket, getMedia]);

    const acceptCall = useCallback(async () => {
        if (!incomingCall) return;
        // Try to get media but don't block the call if it fails
        try {
            await getMedia(incomingCall.callType);
        } catch (err) {
            console.warn('Media access failed, proceeding without local stream:', err);
        }
        setCallType(incomingCall.callType);
        setCallRoomId(incomingCall.roomId);
        setCallStatus('active');
        createPeer(incomingCall.callerSocketId, incomingCall.callerName, localRef.current, false);
        socket?.emit('acceptCall', { callerSocketId: incomingCall.callerSocketId });
        setIncomingCall(null);
    }, [socket, incomingCall, getMedia, createPeer]);

    const declineCall = useCallback(() => {
        if (!incomingCall) return;
        socket?.emit('declineCall', { callerSocketId: incomingCall.callerSocketId });
        setIncomingCall(null);
        setCallStatus('idle');
    }, [socket, incomingCall]);

    const endCall = useCallback(() => {
        if (callRoomId) {
            socket?.emit('callEnded', { roomId: callRoomId });
            // Emit call log with duration
            const startedAt = callStartRef.current;
            const endedAt = new Date().toISOString();
            const durationSeconds = startedAt
                ? Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000)
                : 0;
            const endEvent = {
                id: `cl-local-end-${Date.now()}`,
                logType: 'ended' as const,
                callType: callType ?? 'audio',
                initiatorName: 'You',
                startedAt: startedAt ?? endedAt,
                endedAt,
                durationSeconds,
                timestamp: endedAt,
                roomId: callRoomId,
            };
            callEventBus.emit(endEvent);
            socket?.emit('callLog', {
                roomId: callRoomId,
                logType: 'ended',
                callType: callType ?? 'audio',
                startedAt: startedAt ?? endedAt,
                endedAt,
                durationSeconds,
            });
        }
        callStartRef.current = null;
        cleanup();
    }, [socket, callRoomId, callType, cleanup]);

    const toggleMic = useCallback(() => {
        localRef.current?.getAudioTracks().forEach(t => {
            t.enabled = !t.enabled;
        });
        setIsMuted(m => !m);
    }, []);

    const toggleCamera = useCallback(() => {
        localRef.current?.getVideoTracks().forEach(t => {
            t.enabled = !t.enabled;
        });
        setIsCameraOff(c => !c);
    }, []);

    const toggleScreenShare = useCallback(async () => {
        if (isScreenSharing) {
            screenStream.current?.getTracks().forEach(t => t.stop());
            screenStream.current = null;
            // Revert to camera
            const camTrack = localRef.current?.getVideoTracks()[0];
            if (camTrack) {
                Object.values(peersRef.current).forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                    if (sender && camTrack) sender.replaceTrack(camTrack);
                });
            }
            setIsScreenSharing(false);
        } else {
            try {
                const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStream.current = screen;
                const screenTrack = screen.getVideoTracks()[0];
                Object.values(peersRef.current).forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) sender.replaceTrack(screenTrack);
                });
                screenTrack.onended = () => setIsScreenSharing(false);
                setIsScreenSharing(true);
            } catch (err) {
                console.error('Screen share failed:', err);
            }
        }
    }, [isScreenSharing]);

    return (
        <CallContext.Provider value={{
            callStatus, callType, callRoomId, incomingCall,
            localStream, remoteStreams,
            isMuted, isCameraOff, isScreenSharing, mediaError,
            startCall, acceptCall, declineCall, endCall,
            toggleMic, toggleCamera, toggleScreenShare,
        }}>
            {children}
        </CallContext.Provider>
    );
};

export const useCall = (): CallContextValue => {
    const ctx = useContext(CallContext);
    if (!ctx) throw new Error('useCall must be used inside CallProvider');
    return ctx;
};
