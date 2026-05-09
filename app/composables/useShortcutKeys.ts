import { onKeyDown } from '@vueuse/core';

/**
 * Registers global keyboard shortcuts for the app.
 *
 * | Key | Action |
 * |---|---|
 * | `t` | Open the new-todo dialog |
 * | `l` | Open the new-list dialog |
 *
 * Shortcuts are suppressed when focus is inside an INPUT, TEXTAREA, or an
 * overlay content element so they don't interfere with user typing.
 *
 * Register this once in `app.vue`.
 */
export function useShortcutKeys() {
    const dialog = useDialog();
    onKeyDown(['t', 'l'], (event) => {
        const activeElement = document.activeElement;

        if (activeElement && activeElement.className === 'v-overlay__content') return;
        if (activeElement && activeElement.tagName === 'INPUT') return;
        if (activeElement && activeElement.tagName === 'TEXTAREA') return;

        if (event.key === 't') {
            dialog.value.open = true;
            dialog.value.page = 'todo';
        }

        if (event.key === 'l') {
            dialog.value.open = true;
            dialog.value.page = 'list';
        }
    });
}
