export type TaskStatus = 'pending' | 'completed';
export interface Task {
    id: string;
    userId: number,
    title: string;
    description: string;
    createdAt: string | Date;
    status: TaskStatus;
}