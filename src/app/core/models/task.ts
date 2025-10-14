export type TaskStatus = 'pending' | 'completed';
export interface Task { id: string; title: string; description: string; createdAt: string | Date; status: TaskStatus; }
