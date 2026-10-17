import { describe, expect, it } from 'vitest';
import { LIST_TEMPLATES } from '../../shared/utils/listTemplates';

describe('LIST_TEMPLATES', () => {
    it('provides a blank template with no preset name', () => {
        expect(LIST_TEMPLATES.blank).toMatchObject({
            label: 'Blank',
            name: '',
            icon: 'mdi-format-list-bulleted',
            defaultView: 'list',
        });
    });

    it('provides a shopping template with a cart icon', () => {
        expect(LIST_TEMPLATES.shopping).toMatchObject({
            label: 'Shopping',
            name: 'Shopping',
            icon: 'mdi-cart',
            defaultView: 'list',
        });
    });

    it('gives every template a label and an mdi icon', () => {
        for (const template of Object.values(LIST_TEMPLATES)) {
            expect(template.label).not.toEqual('');
            expect(template.icon).toMatch(/^mdi-/);
        }
    });
});
