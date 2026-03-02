import React, { useEffect, useState } from 'react';
import { useChat } from '../context/ChatContext';
import { useCall } from '../context/CallContext';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import CreateRoomModal from '../components/CreateRoomModal';
import CallScreen from '../components/call/CallScreen';
import CallIncoming from '../components/call/CallIncoming';

const Chat: React.FC = () => {
    const { loadRooms, activeRoom } = useChat();
    const { callStatus } = useCall();
    const [showModal, setShowModal] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => { loadRooms(); }, [loadRooms]);

    const isInCall = callStatus === 'calling' || callStatus === 'active';

    return (
        <div className="flex h-screen bg-[#000] overflow-hidden">
            {/* ── Sidebar ── */}
            <Sidebar
                onCreateRoom={() => setShowModal(true)}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* ── Mobile overlay backdrop ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Main content ── */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
                {isInCall ? (
                    <CallScreen />
                ) : activeRoom ? (
                    <ChatArea onOpenSidebar={() => setSidebarOpen(true)} />
                ) : (
                    /* ── Empty state ── */
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center text-center gap-4 max-w-xs px-6">
                            {/* Mobile hamburger when no room selected */}
                            <button
                                className="md:hidden mb-2 w-8 h-8 flex items-center justify-center border border-[#262626] rounded-lg text-[#737373]"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                                </svg>
                            </button>

                            <div className="w-14 h-14 rounded-2xl border border-[#262626] bg-[#141414] flex items-center justify-center">
                                <svg className="w-7 h-7 text-[#525252]" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white mb-1">No room selected</h2>
                                <p className="text-xs text-[#737373] leading-relaxed">
                                    Choose a room from the sidebar or create a new one.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="bw-btn-primary text-xs px-5 py-2.5"
                            >
                                + Create Room
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Incoming call modal — always mounted */}
            <CallIncoming />

            {showModal && <CreateRoomModal onClose={() => setShowModal(false)} />}
        </div>
    );
};

export default Chat;
