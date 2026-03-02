import React from 'react';

const FEATURES = [
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
        ),
        title: 'Real-Time Messaging',
        desc: 'Instant message delivery via WebSockets. Zero latency, persistent history.',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0111.62 19a19.5 19.5 0 01-6-6A19.79 19.79 0 013 4.18 2 2 0 014.96 2H8a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
        ),
        title: 'Audio Calling',
        desc: 'Crystal-clear peer-to-peer audio via WebRTC. No servers in the audio path.',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
                <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
        ),
        title: 'Video Calling',
        desc: 'HD video with screen sharing. One click to start, full mesh peer connections.',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
        ),
        title: 'Room Collaboration',
        desc: 'Organize conversations into focused rooms. See who\'s online at a glance.',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
        ),
        title: 'Secure by Default',
        desc: 'JWT authentication, bcrypt hashing, token-verified WebSocket connections.',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><path d="M8 12l2.5 2.5L16 9" />
            </svg>
        ),
        title: 'Minimal Interface',
        desc: 'No distractions. Pure focus. Everything you need, nothing you don\'t.',
    },
];

interface Props {
    onGetStarted: () => void;
    onSignIn: () => void;
}

const Landing: React.FC<Props> = ({ onGetStarted, onSignIn }) => (
    <div className="min-h-screen bg-[#000] text-white overflow-y-auto overflow-x-hidden">

        {/* ── NAV ─────────────────────────────────────────── */}
        <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-[#1f1f1f] bg-[#000]/90 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md border border-[#262626] bg-[#141414] flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                </div>
                <span className="font-bold text-sm tracking-tight">ChatRooms</span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm text-[#737373]">
                <a href="#features" className="hover:text-white transition-colors duration-150">Features</a>
                <a href="#how" className="hover:text-white transition-colors duration-150">How it works</a>
            </div>

            <div className="flex items-center gap-3">
                <button onClick={onSignIn} className="text-sm text-[#737373] hover:text-white transition-colors duration-150 px-3 py-1.5">
                    Sign in
                </button>
                <button onClick={onGetStarted} className="bw-btn-primary text-xs px-4 py-2">
                    Get started
                </button>
            </div>
        </nav>

        {/* ── HERO ────────────────────────────────────────── */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#262626] bg-[#0f0f0f] px-4 py-1.5 text-xs text-[#b3b3b3] tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Open Source · WebRTC · Socket.IO
            </div>

            {/* Headline */}
            <h1 className="max-w-3xl text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.04] mb-6 text-white">
                Minimal Communication.
                <br />
                <span className="text-[#737373]">Maximum Focus.</span>
            </h1>

            <p className="max-w-lg text-[#737373] text-base sm:text-lg md:text-xl leading-relaxed mb-10 px-2">
                Real-time messaging, audio, and video — built for clarity. No noise. No distractions.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-20">
                <button onClick={onGetStarted} className="bw-btn-primary px-8 py-3.5 text-sm">
                    Create Room →
                </button>
                <button onClick={onSignIn} className="bw-btn-outline px-8 py-3.5 text-sm">
                    Sign In
                </button>
            </div>

            {/* Product preview — hide on small screens to avoid overflow */}
            <div className="w-full max-w-4xl hidden sm:block">
                <div className="rounded-2xl border border-[#1f1f1f] bg-[#0f0f0f] overflow-hidden">
                    {/* Browser frame */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1f1f1f] bg-[#0a0a0a]">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#262626]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#262626]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#262626]" />
                        </div>
                        <div className="flex-1 mx-4 h-5 rounded bg-[#1a1a1a] border border-[#262626] flex items-center px-3">
                            <span className="text-[10px] text-[#525252]">chatrooms.app</span>
                        </div>
                    </div>
                    {/* Chat preview */}
                    <div className="flex h-64">
                        <div className="w-52 border-r border-[#1f1f1f] p-3 flex flex-col gap-1">
                            <div className="flex items-center gap-2 px-2 py-2 mb-1">
                                <div className="w-5 h-5 rounded bg-[#262626] flex items-center justify-center">
                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                                </div>
                                <span className="text-xs font-bold text-white">ChatRooms</span>
                            </div>
                            <p className="text-[9px] text-[#525252] uppercase tracking-widest px-2 mb-1">Rooms</p>
                            {[
                                { name: 'general', active: true },
                                { name: 'engineering', active: false },
                                { name: 'design', active: false },
                            ].map(r => (
                                <div key={r.name} className={`relative flex items-center gap-2 px-2 py-2 rounded-lg ${r.active ? 'bg-[#1a1a1a]' : ''}`}>
                                    {r.active && <div className="absolute left-0 top-[20%] bottom-[20%] w-0.5 rounded-r bg-white" />}
                                    <div className="w-6 h-6 rounded-md bg-[#262626] flex items-center justify-center text-[9px] font-bold text-white">
                                        {r.name[0].toUpperCase()}
                                    </div>
                                    <span className={`text-xs ${r.active ? 'text-white font-medium' : 'text-[#737373]'}`}>{r.name}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex-1 flex flex-col">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
                                <span className="text-xs font-semibold text-white">general</span>
                                <div className="flex gap-1.5">
                                    <div className="w-6 h-6 rounded border border-[#262626] flex items-center justify-center">
                                        <svg className="w-3 h-3 text-[#737373]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0111.62 19a19.5 19.5 0 01-6-6A19.79 19.79 0 013 4.18 2 2 0 014.96 2H8a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                                    </div>
                                    <div className="w-6 h-6 rounded border border-[#262626] flex items-center justify-center">
                                        <svg className="w-3 h-3 text-[#737373]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden">
                                {[
                                    { u: 'A', msg: 'Just shipped the new WebRTC module', own: false },
                                    { u: 'B', msg: 'Looks great! Love the minimal design 🎯', own: false },
                                    { u: 'Y', msg: 'Thanks! No colors, just contrast.', own: true },
                                ].map((m, i) => (
                                    <div key={i} className={`flex items-end gap-2 max-w-[80%] ${m.own ? 'self-end flex-row-reverse' : ''}`}>
                                        <div className="w-5 h-5 rounded-full bg-[#262626] flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0">{m.u}</div>
                                        <div className={`px-3 py-1.5 rounded-xl text-[10px] leading-relaxed ${m.own ? 'bg-[#1a1a1a] border border-[#262626]' : 'bg-[#111] border border-[#1f1f1f]'}`}>{m.msg}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="px-4 py-3 border-t border-[#1f1f1f]">
                                <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#262626] rounded-full px-4 py-2">
                                    <span className="text-[10px] text-[#525252] flex-1">Type a message…</span>
                                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                                        <svg className="w-2.5 h-2.5 text-black" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* ── FEATURES ────────────────────────────────────── */}
        <section id="features" className="py-24 px-6 border-t border-[#1f1f1f]">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-14">
                    <p className="text-xs font-semibold text-[#737373] uppercase tracking-widest mb-3">Features</p>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">
                        Everything you need
                    </h2>
                    <p className="text-[#737373] text-base max-w-xl mx-auto">
                        Built lean. No bloat. Every feature serves a clear purpose.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {FEATURES.map(f => (
                        <div
                            key={f.title}
                            className="p-5 rounded-xl border border-[#262626] bg-[#0f0f0f] hover:bg-[#141414] hover:border-[#333] transition-all duration-150 cursor-default"
                        >
                            <div className="w-9 h-9 rounded-lg border border-[#262626] bg-[#1a1a1a] flex items-center justify-center text-[#b3b3b3] mb-4">
                                {f.icon}
                            </div>
                            <h3 className="font-semibold text-white text-sm mb-1.5">{f.title}</h3>
                            <p className="text-[#737373] text-xs leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────── */}
        <section id="how" className="py-24 px-6 border-t border-[#1f1f1f]">
            <div className="max-w-3xl mx-auto text-center">
                <p className="text-xs font-semibold text-[#737373] uppercase tracking-widest mb-3">How it works</p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-12">
                    Three steps. That's it.
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { n: '01', t: 'Create an account', d: 'Register in under 30 seconds.' },
                        { n: '02', t: 'Open or join a room', d: 'Name your space and invite your team.' },
                        { n: '03', t: 'Message, call, share', d: 'Text · audio · video — all in one place.' },
                    ].map(s => (
                        <div key={s.n} className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-xl border border-[#262626] bg-[#0f0f0f] flex items-center justify-center">
                                <span className="text-sm font-black text-white">{s.n}</span>
                            </div>
                            <h3 className="font-semibold text-white text-sm">{s.t}</h3>
                            <p className="text-[#737373] text-xs leading-relaxed">{s.d}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* ── CTA BANNER ──────────────────────────────────── */}
        <section className="py-24 px-6 border-t border-[#1f1f1f]">
            <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
                    Ready to focus?
                </h2>
                <p className="text-[#737373] text-base mb-8">
                    No setup. No cost. No noise.
                </p>
                <button onClick={onGetStarted} className="bw-btn-primary px-10 py-3.5 text-sm">
                    Start for free →
                </button>
            </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────── */}
        <footer className="border-t border-[#1f1f1f] px-4 sm:px-8 py-8">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-[#141414] border border-[#262626] flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                    </div>
                    <span className="text-xs font-bold text-white">ChatRooms</span>
                </div>
                <p className="text-xs text-[#525252]">React · Express · Prisma · Socket.IO · WebRTC · {new Date().getFullYear()}</p>
                <div className="flex gap-5 text-xs text-[#525252]">
                    <button onClick={onSignIn} className="hover:text-white transition-colors duration-150">Sign in</button>
                    <button onClick={onGetStarted} className="hover:text-white transition-colors duration-150">Get started</button>
                </div>
            </div>
        </footer>
    </div>
);

export default Landing;
