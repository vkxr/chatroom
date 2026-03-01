import React, { useEffect, useRef } from 'react';

interface Props {
    stream: MediaStream | null;
    name: string;
    isMuted?: boolean;       // audio muted (for remote — mic icon overlay)
    isCameraOff?: boolean;   // cam off → show initial
    isSelf?: boolean;        // local preview styling
    isSpeaking?: boolean;    // subtle white border
}

const VideoTile: React.FC<Props> = ({ stream, name, isMuted, isCameraOff, isSelf, isSpeaking }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const showPlaceholder = !stream || isCameraOff;

    return (
        <div
            className={[
                'relative overflow-hidden rounded-xl bg-[#0f0f0f]',
                'border transition-all duration-150',
                isSpeaking ? 'border-white/30' : 'border-[#1f1f1f]',
                isSelf ? 'w-40 h-28' : 'w-full h-full',
            ].join(' ')}
        >
            {/* Video element */}
            {!showPlaceholder && (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isSelf}
                    className="w-full h-full object-cover"
                    style={{ transform: isSelf ? 'scaleX(-1)' : undefined }}
                />
            )}

            {/* Camera-off placeholder */}
            {showPlaceholder && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f0f]">
                    <span className="text-4xl font-bold text-white/80 uppercase select-none">
                        {name.charAt(0)}
                    </span>
                </div>
            )}

            {/* Name label */}
            <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                <span className="text-xs text-[#a1a1a1] font-medium truncate max-w-[100px]">
                    {isSelf ? 'You' : name}
                </span>
            </div>

            {/* Muted icon */}
            {isMuted && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round">
                        <line x1="1" y1="1" x2="23" y2="23" />
                        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                    </svg>
                </div>
            )}
        </div>
    );
};

export default VideoTile;
