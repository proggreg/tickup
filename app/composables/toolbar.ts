/**
 * Singleton boolean state that controls whether the floating toolbar is visible.
 *
 * `true` shows the toolbar; `false` hides it.
 */
export const useToolbar = () => useState<boolean>('useToolbar', () => false);
