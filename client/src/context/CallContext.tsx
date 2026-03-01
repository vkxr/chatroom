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

    const peersRef = useRef<Record<string, RTCPeerConnection>>({});
    const localRef = useRef<MediaStream | null>(null);
    const screenStream = useRef<MediaStream | null>(null);
    const callStartRef = useRef<string | null>(null); // ISO timestamp when call started

    // ── Media helpers ──────────────────────────────────────────────────────
    const getMedia = useCallback(async (type: CallType): Promise<MediaStream> => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: type === 'video',
        });
        localRef.current = stream;
        setLocalStream(stream);
        return stream;
    }, []);

    const cleanup = useCallback(() => {
        // Close all peer connections
        Object.values(peersRef.current).forEach(pc => pc.close());
        peersRef.current = {};

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
        stream: MediaStream,
        isInitiator: boolean,
    ): RTCPeerConnection => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        // Add local tracks
        stream.getTracks().forEach(t => pc.addTrack(t, stream));

        // ICE candidates → relay via socket
        pc.onicecandidate = (e) => {
            if (e.candidate && socket) {
                socket.emit('callSignal', {
                    targetSocketId: remoteSocketId,
                    signal: { type: 'ice', candidate: e.candidate },
                });
            }
        };

        // Remote tracks
        pc.ontrack = (e) => {
            const [remoteStream] = e.streams;
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
            setIncomingCall(info);
            setCallStatus('ringing');
        };

        // Caller: someone accepted → create peer and initiate offer
        const handleCallAccepted = async ({ accepterSocketId, accepterName }: { accepterSocketId: string; accepterName: string }) => {
            setCallStatus('active');
            const stream = localRef.current ?? await getMedia(callType ?? 'video');
            createPeer(accepterSocketId, accepterName, stream, true);
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
                    // Callee receiving offer — create peer (non-initiator)
                    const stream = localRef.current!;
                    pc = createPeer(fromSocketId, fromName, stream, false);
                }
                await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp!));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('callSignal', {
                    targetSocketId: fromSocketId,
                    signal: { type: 'answer', sdp: pc.localDescription },
                });
                setCallStatus('active');
            } else if (signal.type === 'answer' && pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp!));
            } else if (signal.type === 'ice' && pc) {
                await pc.addIceCandidate(new RTCIceCandidate(signal.candidate!));
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
        try {
            await getMedia(type);
            setCallType(type);
            setCallRoomId(roomId);
            setCallStatus('calling');
            const startedAt = new Date().toISOString();
            callStartRef.current = startedAt;
            socket?.emit('callUser', { roomId, callType: type });
            // Emit call log — direct to local bus + server relay to other room members
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
        } catch (err) {
            console.error('Media access failed:', err);
        }
    }, [socket, getMedia]);

    const acceptCall = useCallback(async () => {
        if (!incomingCall) return;
        try {
            const stream = await getMedia(incomingCall.callType);
            setCallType(incomingCall.callType);
            setCallRoomId(incomingCall.roomId);
            // Create peer for the caller (non-initiator — wait for offer)
            createPeer(incomingCall.callerSocketId, incomingCall.callerName, stream, false);
            socket?.emit('acceptCall', { callerSocketId: incomingCall.callerSocketId });
            setIncomingCall(null);
        } catch (err) {
            console.error('Media access failed:', err);
        }
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
            isMuted, isCameraOff, isScreenSharing,
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
