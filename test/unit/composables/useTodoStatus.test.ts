import { describe, it, expect } from 'vitest';
import { useTodoStatus } from '../../../app/composables/useTodoStatus';

describe('useTodoStatus', () => {
    const { isTodoClosed } = useTodoStatus();

    describe('isTodoClosed', () => {
        it('returns false for null', () => {
            expect(isTodoClosed(null)).toBe(false);
        });

        it('returns false for undefined', () => {
            expect(isTodoClosed(undefined)).toBe(false);
        });

        it('returns false for empty string', () => {
            expect(isTodoClosed('')).toBe(false);
        });

        it('returns true for "closed"', () => {
            expect(isTodoClosed('closed')).toBe(true);
        });

        it('returns true for "done"', () => {
            expect(isTodoClosed('done')).toBe(true);
        });

        it('returns true for "Closed" (mixed case)', () => {
            expect(isTodoClosed('Closed')).toBe(true);
        });

        it('returns true for "DONE" (uppercase)', () => {
            expect(isTodoClosed('DONE')).toBe(true);
        });

        it('returns true for whitespace-padded "  closed  "', () => {
            expect(isTodoClosed('  closed  ')).toBe(true);
        });

        it('returns true for whitespace-padded "  done  "', () => {
            expect(isTodoClosed('  done  ')).toBe(true);
        });

        it('returns false for "open"', () => {
            expect(isTodoClosed('open')).toBe(false);
        });

        it('returns false for "Open"', () => {
            expect(isTodoClosed('Open')).toBe(false);
        });

        it('returns false for "in_progress"', () => {
            expect(isTodoClosed('in_progress')).toBe(false);
        });
    });
});
