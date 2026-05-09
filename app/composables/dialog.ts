/**
 * Singleton state composable that controls which dialog is open.
 *
 * Set `page` to a dialog identifier (e.g. `'todo'` or `'list'`) and `open`
 * to `true` to open it.  Set `open` to `false` to close.
 *
 * @example
 * ```ts
 * const dialog = useDialog()
 * dialog.value = { open: true, page: 'todo' }
 * ```
 */
export const useDialog = () =>
    useState<{ page: string; open: boolean }>('useDialog', () => ({ page: '', open: false }));
