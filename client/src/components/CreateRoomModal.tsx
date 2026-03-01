import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';

interface Props { onClose: () => void; }

const CreateRoomModal: React.FC<Props> = ({ onClose }) => {
    const { createRoom } = useChat();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setError('');
        setLoading(true);
        try {
            await createRoom(name.trim(), description.trim());
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to create room');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            style={{ backdropFilter: 'blur(8px)' }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm bg-[#141414] border border-[#262626] rounded-2xl p-7 animate-[scaleIn_0.18s_ease-out_both]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-base font-bold text-white">Create a room</h2>
                    <p className="text-xs text-[#737373] mt-1">Give your room a name and optional description.</p>
                </div>

                {error && (
                    <div className="mb-4 px-3 py-2.5 rounded-lg border border-[#262626] bg-[#0f0f0f] text-xs text-[#b3b3b3]">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="room-name" className="text-[9px] font-semibold text-[#737373] uppercase tracking-widest">
                            Room name
                        </label>
                        <input
                            id="room-name"
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. general, engineering"
                            required
                            autoFocus
                            className="bw-input"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="room-desc" className="text-[9px] font-semibold text-[#737373] uppercase tracking-widest">
                            Description <span className="text-[#525252] normal-case tracking-normal">(optional)</span>
                        </label>
                        <input
                            id="room-desc"
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="What's this room about?"
                            className="bw-input"
                        />
                    </div>

                    <div className="flex gap-3 mt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bw-btn-outline flex-1 py-2.5 text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="bw-btn-primary flex-1 py-2.5 text-xs"
                        >
                            {loading ? 'Creating…' : 'Create room'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoomModal;
