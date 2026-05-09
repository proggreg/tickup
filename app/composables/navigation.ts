/**
 * Singleton boolean state that controls sidebar / navigation visibility.
 *
 * `true` means the navigation drawer is open; `false` means it is collapsed.
 */
export const useNav = () => useState<boolean>('useNav', () => true);
