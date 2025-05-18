// File: packages/types/src/index.ts

// Gender enum
export enum Gender {
    MALE = 'm',
    FEMALE = 'f'
};

// Core User interface
export interface User {
    id: string;
    name: string;
    email: string;
    gender: Gender;
    dateOfBirth: Date;
}

// API request interfaces
export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    gender: Gender;
    dateOfBirth?: string; // String format for easy form handling
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    gender?: Gender;
    dateOfBirth?: string;
}

// API response wrapper
// export interface ApiResponse<T> {
//     success: boolean;
//     data?: T;
//     error?: string;
//     message?: string;
// }