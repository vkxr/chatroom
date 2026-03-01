import React from 'react';
import { useCall } from '../../context/CallContext';
import { useChat } from '../../context/ChatContext';
import VideoTile from './VideoTile';
import CallControls from './CallControls';

const CallingSpinner: React.FC<{ name: string }> = ({ name }) => (
    <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-[#1f1f1f] border border-[#262626] flex items-center justify-center">
            <span className="text-3xl font-bold text-white/80 uppercase">{name.charAt(0)}</span>
        </div>
        <p className="text-[#a1a1a1] text-sm">Calling…</p>
        <div className="flex gap-1.5">
            {[0, 0.3, 0.6].map(d => (
                <span
                    key={d}
                    className="w-1.5 h-1.5 rounded-full bg-[#4b4b4b]"
                    style={{ animation: `typing 1.4s ease-in-out ${d}s infinite` }}
                />
            ))}
        </div>
    </div>
);

const CallScreen: React.FC = () => {
    const { callStatus, callType, localStream, remoteStreams, isCameraOff } = useCall();
    const { activeRoom } = useChat();
    const roomName = activeRoom?.name ?? 'Call';

    const remoteEntries = Object.entries(remoteStreams);
    const hasRemote = remoteEntries.length > 0;

    // Grid cols based on participant count
    const gridClass = (() => {
        const count = remoteEntries.length;
        if (count === 0) return '';
        if (count === 1) return '';
        if (count <= 4) return 'grid grid-cols-2';
        return 'grid grid-cols-3';
    })();

    return (
        <div className="flex-1 flex flex-col bg-[#000] relative overflow-hidden">
            {/* ── Header strip ── */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#1f1f1f] flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-white/30" />
                    <span className="text-sm font-medium text-[#a1a1a1] tracking-wide">{roomName}</span>
                </div>
                <span className="text-xs text-[#6b7280] uppercase tracking-widest">
                    {callType === 'video' ? 'Video Call' : 'Audio Call'}
                </span>
                <div className="w-16" /> {/* spacer */}
            </div>

            {/* ── Main video area ── */}
            <div className="flex-1 flex items-center justify-center p-5 overflow-hidden">
                {/* Calling state — no peers yet */}
                {callStatus === 'calling' && !hasRemote && (
                    <CallingSpinner name={roomName} />
                )}

                {/* Active — remote peers */}
                {(callStatus === 'active' || (callStatus === 'calling' && hasRemote)) && (
                    <div
                        className={[
                            'w-full max-w-5xl gap-3',
                            hasRemote
                                ? remoteEntries.length === 1
                                    ? 'flex items-center justify-center'
                                    : gridClass
                                : '',
                        ].join(' ')}
                        style={{ height: '100%', maxHeight: 'calc(100vh - 200px)' }}
                    >
                        {remoteEntries.map(([socketId, { stream, name }]) => (
                            <VideoTile
                                key={socketId}
                                stream={stream}
                                name={name}
                                isMuted={false}
                                isCameraOff={false}
                            />
                        ))}
                    </div>
                )}

                {/* Audio-only: show all names as initials without video */}
                {callType === 'audio' && callStatus === 'active' && remoteEntries.length === 0 && (
                    <CallingSpinner name={roomName} />
                )}
            </div>

            {/* ── Self-view PiP ── */}
            {callType === 'video' && (
                <div
                    className="absolute bottom-24 right-5"
                    style={{ zIndex: 20 }}
                >
                    <VideoTile
                        stream={localStream}
                        name="You"
                        isCameraOff={isCameraOff}
                        isSelf
                    />
                </div>
            )}

            {/* ── Controls ── */}
            <CallControls roomName={roomName} />
        </div>
    );
};

export default CallScreen;
