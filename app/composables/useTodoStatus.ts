/**
 * Helpers for interpreting a todo's status string.
 *
 * Status comparisons are case-insensitive and trim whitespace so values
 * like `'Closed'`, `'  DONE  '`, and `'done'` are all treated as closed.
 */
export const useTodoStatus = () => {
    const isTodoClosed = (status?: string | null) => {
        if (!status) {
            return false;
        }

        const normalizedStatus = status.trim().toLowerCase();
        return normalizedStatus === 'closed' || normalizedStatus === 'done';
    };

    return {
        isTodoClosed,
    };
};
