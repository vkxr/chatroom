import React from 'react';
import { useCall } from '../../context/CallContext';

const VideoCallIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
        <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
);
const AudioCallIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.62 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3 4.18 2 2 0 0 1 4.96 2H8a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const CallIncoming: React.FC = () => {
    const { incomingCall, acceptCall, declineCall } = useCall();
    if (!incomingCall) return null;

    const { callerName, callType } = incomingCall;

    return (
        /* Overlay */
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" style={{ backdropFilter: 'blur(8px)' }}>
            <div className="w-full max-w-sm mx-4 bg-[#111] border border-[#262626] rounded-2xl p-8 flex flex-col items-center gap-6">

                {/* Caller avatar */}
                <div className="w-16 h-16 rounded-full bg-[#1f1f1f] border border-[#262626] flex items-center justify-center">
                    <span className="text-2xl font-bold text-white uppercase">{callerName.charAt(0)}</span>
                </div>

                {/* Info */}
                <div className="text-center">
                    <p className="text-xs text-[#6b7280] uppercase tracking-widest mb-1">
                        Incoming {callType === 'video' ? 'Video' : 'Audio'} Call
                    </p>
                    <h2 className="text-xl font-bold text-white">{callerName}</h2>
                </div>

                {/* Call type icon */}
                <div className="text-[#a1a1a1]">
                    {callType === 'video' ? <VideoCallIcon /> : <AudioCallIcon />}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 w-full">
                    {/* Decline */}
                    <button
                        onClick={declineCall}
                        className="flex-1 py-3 rounded-xl border border-[#262626] text-white text-sm font-semibold hover:bg-[#1a1a1a] active:scale-[0.98] transition-all duration-150"
                    >
                        Decline
                    </button>
                    {/* Accept */}
                    <button
                        onClick={acceptCall}
                        className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-[#e5e5e5] active:scale-[0.98] transition-all duration-150"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CallIncoming;
