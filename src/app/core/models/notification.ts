export interface Notification {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    action?: string;
    duration?: number;
}