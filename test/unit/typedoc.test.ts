import { describe, it, expect, beforeAll } from 'vitest';
import {
    Application,
    type ProjectReflection,
    type DeclarationReflection,
    ReflectionKind,
    TypeDocReader,
    TSConfigReader,
} from 'typedoc';

let project: ProjectReflection;

beforeAll(async () => {
    const app = await Application.bootstrapWithPlugins({}, [
        new TypeDocReader(),
        new TSConfigReader(),
    ]);
    project = (await app.convert())!;
    expect(project, 'TypeDoc failed to parse project').toBeTruthy();
}, 30_000);

/** Finds an exported symbol (function or variable) by name across all modules. */
function findExport(name: string): DeclarationReflection | undefined {
    return project
        .getChildrenByKind(ReflectionKind.Module)
        .flatMap((m) => [
            ...m.getChildrenByKind(ReflectionKind.Function),
            ...m.getChildrenByKind(ReflectionKind.Variable),
        ])
        .find((r) => r.name === name);
}

/**
 * Returns the JSDoc comment text for a reflection.
 * TypeDoc stores the comment on the declaration OR on its first signature.
 */
function getComment(ref: DeclarationReflection): string {
    const direct = ref.comment?.summary ?? [];
    if (direct.length) return direct.map((p) => p.text).join('');
    const sigComment = ref.signatures?.[0]?.comment?.summary ?? [];
    return sigComment.map((p) => p.text).join('');
}

/** Finds the module reflection by its entry-point path fragment. */
function findModule(name: string): DeclarationReflection | undefined {
    return project.getChildrenByKind(ReflectionKind.Module).find((m) => m.name === name);
}

describe('TypeDoc project', () => {
    it('produces a non-empty project', () => {
        expect(project.children?.length).toBeGreaterThan(0);
    });

    it('documents every composable entry point', () => {
        const moduleNames = project.children!.map((c) => c.name);
        const expected = [
            'app/composables/dialog',
            'app/composables/useNotification',
            'app/composables/useShortcutKeys',
            'app/composables/useAppLayout',
            'app/composables/useTodoActions',
            'app/composables/useTodoStatus',
            'app/composables/navigation',
            'app/composables/toolbar',
        ];
        for (const name of expected) {
            expect(moduleNames, `missing module: ${name}`).toContain(name);
        }
    });

    it('documents every store entry point', () => {
        const moduleNames = project.children!.map((c) => c.name);
        expect(moduleNames).toContain('app/stores/lists');
        expect(moduleNames).toContain('app/stores/search');
        expect(moduleNames).toContain('app/stores/settings');
        expect(moduleNames).toContain('app/stores/helpers');
    });

    it('documents the logger utility', () => {
        const moduleNames = project.children!.map((c) => c.name);
        expect(moduleNames).toContain('utils/logger');
    });
});

describe('TypeDoc function reflections', () => {
    it('reflects useDialog', () => {
        expect(findExport('useDialog')).toBeTruthy();
    });

    it('reflects useNotification', () => {
        expect(findExport('useNotification')).toBeTruthy();
    });

    it('reflects useShortcutKeys', () => {
        expect(findExport('useShortcutKeys')).toBeTruthy();
    });

    it('reflects useAppLayout', () => {
        expect(findExport('useAppLayout')).toBeTruthy();
    });

    it('reflects useTodoActions', () => {
        expect(findExport('useTodoActions')).toBeTruthy();
    });

    it('reflects useTodoStatus', () => {
        expect(findExport('useTodoStatus')).toBeTruthy();
    });

    it('reflects useListsStore', () => {
        expect(findExport('useListsStore')).toBeTruthy();
    });

    it('reflects useSearchStore', () => {
        expect(findExport('useSearchStore')).toBeTruthy();
    });

    it('reflects logger', () => {
        expect(findExport('logger')).toBeTruthy();
    });

    it('reflects createNewTodoState', () => {
        expect(findExport('createNewTodoState')).toBeTruthy();
    });

    it('reflects createNewListState', () => {
        expect(findExport('createNewListState')).toBeTruthy();
    });
});

describe('TypeDoc JSDoc coverage', () => {
    it('useDialog has a JSDoc comment', () => {
        const symbol = findExport('useDialog');
        expect(symbol).toBeTruthy();
        expect(getComment(symbol!).length).toBeGreaterThan(0);
    });

    it('useNotification has a JSDoc comment', () => {
        const symbol = findExport('useNotification');
        expect(symbol).toBeTruthy();
        expect(getComment(symbol!).length).toBeGreaterThan(0);
    });

    it('useShortcutKeys has a JSDoc comment', () => {
        const symbol = findExport('useShortcutKeys');
        expect(symbol).toBeTruthy();
        expect(getComment(symbol!).length).toBeGreaterThan(0);
    });

    it('useAppLayout has a JSDoc comment', () => {
        const symbol = findExport('useAppLayout');
        expect(symbol).toBeTruthy();
        expect(getComment(symbol!).length).toBeGreaterThan(0);
    });

    it('logger module exports members', () => {
        const mod = findModule('utils/logger');
        expect(mod).toBeTruthy();
        expect(mod?.children?.length).toBeGreaterThan(0);
    });

    it('createNewListState has a JSDoc comment', () => {
        const symbol = findExport('createNewListState');
        expect(symbol).toBeTruthy();
        expect(getComment(symbol!).length).toBeGreaterThan(0);
    });

    it('createNewTodoState has a JSDoc comment', () => {
        const symbol = findExport('createNewTodoState');
        expect(symbol).toBeTruthy();
        expect(getComment(symbol!).length).toBeGreaterThan(0);
    });
});
