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
