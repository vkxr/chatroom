import React from 'react';
import { useCall } from '../../context/CallContext';

// ── Icon components (pure SVG, no external deps) ───────────────────────────
const MicIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
    </svg>
);
const MicOffIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23M12 19v4M8 23h8" />
    </svg>
);
const CameraIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
        <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
);
const CameraOffIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
        <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);
const ScreenIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
    </svg>
);
const PhoneOffIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
        <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07C9.44 17.25 8.76 16.6 8.1 15.9M6.1 6.1A19.79 19.79 0 0 0 3.03 14.73 2 2 0 0 0 5 16.95h3a2 2 0 0 0 2-1.72 12.84 12.84 0 0 1 .7-2.81 2 2 0 0 0-.45-2.11L9 9" />
        <line x1="23" y1="1" x2="1" y2="23" />
    </svg>
);

interface BtnProps {
    onClick: () => void;
    active?: boolean;  // true = currently OFF (mic muted, cam off)
    danger?: boolean;
    title: string;
    children: React.ReactNode;
}

const Btn: React.FC<BtnProps> = ({ onClick, active, danger, title, children }) => (
    <button
        onClick={onClick}
        title={title}
        className={[
            'relative flex items-center justify-center',
            'w-11 h-11 rounded-full',
            'border transition-all duration-150',
            'focus:outline-none',
            danger
                ? 'border-white/30 text-white hover:bg-white hover:text-black active:scale-95'
                : active
                    ? 'bg-white text-black border-white active:scale-95'
                    : 'bg-transparent border-[#262626] text-white hover:bg-[#1a1a1a] active:scale-95',
        ].join(' ')}
    >
        {children}
    </button>
);

interface Props { roomName: string; }

const CallControls: React.FC<Props> = ({ roomName }) => {
    const { isMuted, isCameraOff, isScreenSharing, callType, toggleMic, toggleCamera, toggleScreenShare, endCall } = useCall();

    return (
        <div className="absolute bottom-0 inset-x-0 flex flex-col items-center pb-8 gap-3 pointer-events-none">
            {/* Room label */}
            <p className="text-xs text-[#6b7280] tracking-widest uppercase">{roomName}</p>

            {/* Controls bar */}
            <div
                className="pointer-events-auto flex items-center gap-3 px-6 py-3 rounded-full border border-[#262626] bg-[#111]/90"
                style={{ backdropFilter: 'blur(12px)' }}
            >
                {/* Mic */}
                <Btn onClick={toggleMic} active={isMuted} title={isMuted ? 'Unmute' : 'Mute'}>
                    {isMuted ? <MicOffIcon /> : <MicIcon />}
                </Btn>

                {/* Camera (video call only) */}
                {callType === 'video' && (
                    <Btn onClick={toggleCamera} active={isCameraOff} title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}>
                        {isCameraOff ? <CameraOffIcon /> : <CameraIcon />}
                    </Btn>
                )}

                {/* Screen share */}
                {callType === 'video' && (
                    <Btn onClick={toggleScreenShare} active={isScreenSharing} title={isScreenSharing ? 'Stop sharing' : 'Share screen'}>
                        <ScreenIcon />
                    </Btn>
                )}

                {/* Divider */}
                <div className="w-px h-6 bg-[#262626] mx-1" />

                {/* Leave */}
                <Btn onClick={endCall} danger title="End call">
                    <PhoneOffIcon />
                </Btn>
            </div>
        </div>
    );
};

export default CallControls;
