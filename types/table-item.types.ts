export interface Column {
    key: string;
    label?: string;
}
export type TodoType = Task;

export interface TableItem {
    key: string;
    raw: TodoType;
    columns: Record<string, any>;
}

export interface GroupItem {
    items: TableItem[];
}

export type ViewType = 'board' | 'list';
