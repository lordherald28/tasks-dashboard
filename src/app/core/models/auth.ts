export interface User {
    id: number;
    email: string;
    name: string;
    avatar?: string;
}

export interface UserWithPassword extends User {
    password: string;
}

export interface LoginResponse {
    success: boolean;
    token?: string;
    user?: User;
    message?: string;
}