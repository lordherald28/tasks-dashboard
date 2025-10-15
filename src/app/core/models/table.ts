export interface TableColumn {
    key: string;
    header: string;
    type?: 'text' | 'badge';
    pipe?: string;
}
