export interface ListTemplate {
    label: string;
    name: string;
    icon: string;
    defaultView: 'list' | 'table' | 'board';
}

export const LIST_TEMPLATES = {
    blank: { label: 'Blank', name: '', icon: 'mdi-format-list-bulleted', defaultView: 'list' },
    shopping: { label: 'Shopping', name: 'Shopping', icon: 'mdi-cart', defaultView: 'list' },
} as const satisfies Record<ListTemplateKey, ListTemplate>;
