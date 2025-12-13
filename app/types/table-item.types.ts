export interface Column {
    key: string;
    label?: string;
}
export type TodoType = Todo;

export interface TableItem {
    key: string;
    raw: TodoType;
    columns: Record<string, any>;
}

export interface GroupItem {
    items: TableItem[];
}
