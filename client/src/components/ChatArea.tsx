import React, { useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useCall } from '../context/CallContext';
import MessageInput from './MessageInput';

const fmtTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const fmtDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
};

const AudioCallIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0111.62 19a19.5 19.5 0 01-6-6A19.79 19.79 0 013 4.18 2 2 0 014.96 2H8a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
);
const VideoCallIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
        <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
);

// ── In-chat call event "pill" ────────────────────────────────────────────────
const CallEventPill: React.FC<{ event: import('../context/ChatContext').CallEvent }> = ({ event }) => {
    const isVideo = event.callType === 'video';
    const isStarted = event.logType === 'started';

    return (
        <div className="flex justify-center my-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#262626] bg-[#0f0f0f] max-w-[90%]">
                {/* Icon */}
                <span className="text-[#737373]">
                    {isVideo ? <VideoCallIcon /> : <AudioCallIcon />}
                </span>

                {/* Text */}
                <span className="text-[10px] text-[#737373] leading-relaxed">
                    {isStarted ? (
                        <>
                            <span className="font-semibold text-[#b3b3b3]">{event.initiatorName}</span>
                            {' started a '}
                            <span className="text-[#b3b3b3]">{isVideo ? 'video' : 'audio'} call</span>
                            <span className="mx-1.5 text-[#525252]">·</span>
                            {fmtTime(event.startedAt)}
                        </>
                    ) : (
                        <>
                            <span className="text-[#b3b3b3]">{isVideo ? 'Video' : 'Audio'} call ended</span>
                            {event.durationSeconds !== undefined && event.durationSeconds > 0 && (
                                <>
                                    <span className="mx-1.5 text-[#525252]">·</span>
                                    <span className="font-medium text-[#737373]">{fmtDuration(event.durationSeconds)}</span>
                                </>
                            )}
                            <span className="mx-1.5 text-[#525252]">·</span>
                            {fmtTime(event.timestamp)}
                        </>
                    )}
                </span>
            </div>
        </div>
    );
};

// ── Main component ───────────────────────────────────────────────────────────
const ChatArea: React.FC = () => {
    const { user } = useAuth();
    const { activeRoom, messages, onlineUsers, typingUsers, callEvents } = useChat();
    const { startCall, callStatus } = useCall();
    const endRef = useRef<HTMLDivElement>(null);

    const canCall = callStatus === 'idle' && !!activeRoom;

    // Merge messages + call events into a single timeline, sorted by timestamp
    const timeline = useMemo(() => {
        const msgs = messages.map(m => ({ kind: 'message' as const, ts: m.createdAt, data: m }));
        const evts = callEvents.map(e => ({ kind: 'call' as const, ts: e.timestamp, data: e }));
        return [...msgs, ...evts].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
    }, [messages, callEvents]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [timeline, typingUsers]);

    if (!activeRoom) return null;

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#1f1f1f] bg-[#0f0f0f] flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#262626] flex items-center justify-center text-xs font-bold text-white flex-shrink-0 uppercase">
                        {activeRoom.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">{activeRoom.name}</h3>
                        <p className="text-[10px] text-[#525252]">{activeRoom.description || 'No description'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {onlineUsers.length > 0 && (
                        <span className="text-[10px] text-[#737373] border border-[#262626] bg-[#141414] px-2.5 py-1 rounded-full">
                            {onlineUsers.length} online
                        </span>
                    )}
                    {onlineUsers.length > 0 && <div className="w-px h-4 bg-[#1f1f1f]" />}

                    <button
                        onClick={() => canCall && startCall(activeRoom.id, 'audio')}
                        title="Start audio call"
                        disabled={!canCall}
                        className="w-7 h-7 rounded-md border border-[#262626] flex items-center justify-center text-[#737373] hover:bg-[#1a1a1a] hover:text-white active:scale-95 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <AudioCallIcon />
                    </button>

                    <button
                        onClick={() => canCall && startCall(activeRoom.id, 'video')}
                        title="Start video call"
                        disabled={!canCall}
                        className="w-7 h-7 rounded-md border border-[#262626] flex items-center justify-center text-[#737373] hover:bg-[#1a1a1a] hover:text-white active:scale-95 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <VideoCallIcon />
                    </button>
                </div>
            </div>

            {/* ── Timeline (messages + call events) ── */}
            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-0.5">
                {timeline.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[#525252] text-xs py-20">
                        <svg className="w-8 h-8 text-[#262626]" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                        No messages yet
                    </div>
                ) : (
                    timeline.map((item, i) => {
                        if (item.kind === 'call') {
                            return <CallEventPill key={item.data.id} event={item.data} />;
                        }

                        const msg = item.data;
                        const isOwn = msg.sender.id === user?.id;
                        const prevItem = i > 0 ? timeline[i - 1] : null;
                        const prevSame = prevItem?.kind === 'message' && prevItem.data.sender.id === msg.sender.id;

                        return (
                            <div
                                key={msg.id}
                                className={`flex items-end gap-2 max-w-[65%] ${isOwn ? 'self-end flex-row-reverse' : 'self-start'} ${prevSame ? 'mt-0.5' : 'mt-4'}`}
                            >
                                <div className={`w-6 h-6 rounded-full bg-[#262626] flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 capitalize mb-0.5 ${prevSame ? 'opacity-0' : ''}`}>
                                    {msg.sender.username.charAt(0)}
                                </div>

                                <div className="flex flex-col gap-0.5">
                                    {!prevSame && (
                                        <span className={`text-[9px] font-medium text-[#525252] px-1 ${isOwn ? 'text-right' : ''}`}>
                                            {isOwn ? 'You' : msg.sender.username}
                                        </span>
                                    )}
                                    <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed text-white ${isOwn
                                            ? 'bg-[#1a1a1a] border border-[#262626] rounded-br-sm'
                                            : 'bg-[#111] border border-[#1f1f1f] rounded-bl-sm'
                                        }`}>
                                        {msg.content}
                                    </div>
                                    <span className={`text-[9px] text-[#525252] px-1 ${isOwn ? 'text-right' : ''}`}>
                                        {fmtTime(msg.createdAt)}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 px-1 py-2 text-[10px] text-[#525252] self-start mt-2">
                        <div className="flex gap-1">
                            {[0, 0.2, 0.4].map(d => (
                                <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#333]" style={{ animation: `typing 1.2s ease-in-out ${d}s infinite` }} />
                            ))}
                        </div>
                        {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
                    </div>
                )}

                <div ref={endRef} />
            </div>

            <MessageInput />
        </div>
    );
};

export default ChatArea;
