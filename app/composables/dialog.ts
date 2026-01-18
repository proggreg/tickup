export const useDialog = () => useState<{ page: string; open: boolean }>('useDialog', () => ({ page: '', open: false }));
