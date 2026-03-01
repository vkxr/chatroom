/**
 * Minimal synchronous event bus for cross-context communication.
 * Used to deliver callLog events from CallContext → ChatContext
 * without creating circular imports.
 */
import type { CallEvent } from './ChatContext';

type CallLogHandler = (event: CallEvent) => void;

const handlers = new Set<CallLogHandler>();

export const callEventBus = {
    emit(event: CallEvent) {
        handlers.forEach(h => h(event));
    },
    subscribe(handler: CallLogHandler): () => void {
        handlers.add(handler);
        return () => { handlers.delete(handler); };
    },
};
