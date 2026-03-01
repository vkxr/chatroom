import React, { useState, useRef, useCallback } from 'react';
import { useChat } from '../context/ChatContext';

const MessageInput: React.FC = () => {
    const { sendMessage, emitTyping, emitStopTyping } = useChat();
    const [text, setText] = useState('');
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
        emitTyping();
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => emitStopTyping(), 1500);
    }, [emitTyping, emitStopTyping]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        sendMessage(text.trim());
        setText('');
        emitStopTyping();
        if (timerRef.current) clearTimeout(timerRef.current);
    }, [text, sendMessage, emitStopTyping]);

    const hasText = text.trim().length > 0;

    return (
        <div className="px-4 py-3 border-t border-[#1f1f1f] bg-[#0f0f0f] flex-shrink-0">
            <form
                onSubmit={handleSubmit}
                className={`flex items-center gap-2 bg-[#000] border rounded-full px-4 py-2 transition-all duration-150 ${hasText ? 'border-[#404040]' : 'border-[#262626]'
                    }`}
            >
                <input
                    type="text"
                    placeholder="Type a message…"
                    value={text}
                    onChange={handleChange}
                    autoFocus
                    className="flex-1 bg-transparent text-sm text-white placeholder-[#525252] outline-none py-1.5"
                />
                <button
                    type="submit"
                    disabled={!hasText}
                    className="w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center bg-white text-black transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[#e5e5e5] active:scale-95"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default MessageInput;
