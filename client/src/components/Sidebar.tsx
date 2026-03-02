import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

interface Props {
    onCreateRoom: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<Props> = ({ onCreateRoom, isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const { rooms, activeRoom, joinRoom, leaveRoom } = useChat();
    const [search, setSearch] = useState('');

    const filtered = useMemo(
        () => rooms.filter(r => r.name.toLowerCase().includes(search.toLowerCase())),
        [rooms, search]
    );

    const handleRoom = (room: typeof rooms[0]) => {
        if (activeRoom?.id === room.id) {
            onClose();
            return;
        }
        if (activeRoom) leaveRoom();
        joinRoom(room);
        onClose(); // auto-close sidebar on mobile after selecting a room
    };

    return (
        <aside className={[
            // Desktop: always visible as static sidebar
            'md:relative md:translate-x-0 md:flex md:w-[280px] md:flex-shrink-0',
            // Mobile: fixed full-height drawer that slides in/out
            'fixed top-0 left-0 h-full z-40 w-[280px] flex-shrink-0',
            'transition-transform duration-300 ease-in-out',
            isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
            'flex flex-col bg-[#0f0f0f] border-r border-[#1f1f1f]',
        ].join(' ')}>
            {/* Brand */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#1f1f1f]">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md border border-[#262626] bg-[#141414] flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                    </div>
                    <span className="font-bold text-sm text-white tracking-tight">ChatRooms</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={onCreateRoom}
                        title="Create room"
                        className="w-7 h-7 rounded-md border border-[#262626] flex items-center justify-center text-[#737373] hover:bg-[#1a1a1a] hover:text-white transition-all duration-150 active:scale-95"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                    {/* Close button — mobile only */}
                    <button
                        onClick={onClose}
                        title="Close sidebar"
                        className="md:hidden w-7 h-7 rounded-md border border-[#262626] flex items-center justify-center text-[#737373] hover:bg-[#1a1a1a] hover:text-white transition-all duration-150"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="px-3 py-2.5 border-b border-[#1f1f1f]">
                <div className="flex items-center gap-2 bg-[#000] border border-[#262626] rounded-lg px-3 py-2">
                    <svg className="w-3.5 h-3.5 text-[#525252] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search rooms…"
                        className="bg-transparent text-xs text-white placeholder-[#525252] outline-none flex-1"
                    />
                </div>
            </div>

            {/* Rooms */}
            <div className="flex-1 overflow-y-auto py-2">
                <p className="px-4 py-2 text-[9px] font-semibold text-[#525252] uppercase tracking-widest">
                    Rooms
                </p>
                {filtered.length === 0 ? (
                    <p className="px-4 py-4 text-xs text-[#525252] text-center">No rooms</p>
                ) : (
                    filtered.map(room => {
                        const isActive = activeRoom?.id === room.id;
                        return (
                            <button
                                key={room.id}
                                onClick={() => handleRoom(room)}
                                className={[
                                    'relative w-full flex items-center gap-3 px-3 py-3 text-left',
                                    'transition-colors duration-150',
                                    isActive ? 'bg-[#141414]' : 'hover:bg-[#0a0a0a] active:bg-[#141414]',
                                ].join(' ')}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-[25%] bottom-[25%] w-0.5 bg-white rounded-r" />
                                )}
                                <div className="w-9 h-9 rounded-lg bg-[#1a1a1a] border border-[#262626] flex items-center justify-center text-xs font-bold text-white flex-shrink-0 uppercase">
                                    {room.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-${isActive ? 'semibold' : 'normal'} ${isActive ? 'text-white' : 'text-[#b3b3b3]'} truncate`}>
                                        {room.name}
                                    </p>
                                    <p className="text-[10px] text-[#525252] truncate">{room.description || 'No description'}</p>
                                </div>
                                {room._count?.members ? (
                                    <span className="text-[9px] text-[#525252] flex-shrink-0">
                                        {room._count.members}
                                    </span>
                                ) : null}
                            </button>
                        );
                    })
                )}
            </div>

            {/* User footer */}
            <div className="border-t border-[#1f1f1f] px-3 py-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#262626] border border-[#333] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 uppercase">
                        {user?.username?.charAt(0) ?? '?'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-white truncate">{user?.username}</p>
                        <p className="text-[9px] text-[#525252] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3d9970] inline-block" />
                            Online
                        </p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    title="Sign out"
                    className="text-[9px] text-[#525252] hover:text-[#b3b3b3] transition-colors whitespace-nowrap py-1 px-2"
                >
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
