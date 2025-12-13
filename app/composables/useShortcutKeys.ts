import { onKeyDown } from '@vueuse/core';

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
