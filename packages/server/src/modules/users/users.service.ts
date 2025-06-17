// File: packages/server/src/users/users.service.ts

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
// import {
//     User,
//     CreateUserRequest,
//     UpdateUserRequest,
// } from '@mono-forge/types';

// Define the absolute path to the JSON file
const USERS_FILE_PATH = process.env.DATA_FILE_PATH;

@Injectable()
export class UsersService {
    // private readonly logger = new Logger(UsersService.name);
    // // In-memory cache of users
    // private users: User[] = [];
    // private initialized = false;

    // constructor() {
    //     // Log the file path for debugging
    //     this.logger.log(`Users file path: ${USERS_FILE_PATH}`);
    // }

    // // Initialize the service by loading users from the JSON file
    // private async init(): Promise<void> {
    //     if (this.initialized) return;

    //     try {
    //         // Create the data directory if it doesn't exist
    //         // try {
    //         //     await fs.mkdir(join(process.cwd(), 'data'), { recursive: true });
    //         //     this.logger.log(`Created data directory: ${join(process.cwd(), 'data')}`);
    //         // } catch (error) {
    //         //     // Directory already exists, ignore
    //         //     this.logger.log('Data directory already exists');
    //         // }

    //         // Try to read the users file
    //         try {
    //             const data = await fs.readFile(USERS_FILE_PATH, 'utf8');
    //             this.users = JSON.parse(data);

    //             // Convert string dates to Date objects
    //             this.users = this.users.map(user => ({
    //                 ...user,
    //                 dateOfBirth: new Date(user.dateOfBirth)
    //             }));

    //             this.logger.log(`Loaded ${this.users.length} users from file`);
    //         } catch (error) {
    //             // If file doesn't exist, create it with empty array
    //             if (error.code === 'ENOENT') {
    //                 this.logger.log('Users file not found, creating empty file');
    //                 this.users = [];
    //                 await this.saveUsers();
    //             } else {
    //                 this.logger.error(`Error reading users file: ${error.message}`);
    //                 throw error;
    //             }
    //         }
    //     } catch (error) {
    //         this.logger.error(`Initialization error: ${error.message}`);
    //         // Initialize with empty array in case of error
    //         this.users = [];
    //     }

    //     this.initialized = true;
    // }

    // // Save users to the JSON file
    // private async saveUsers(): Promise<void> {
    //     // Convert Date objects to ISO strings for JSON serialization
    //     const usersToSave = this.users.map(user => ({
    //         ...user,
    //         dateOfBirth: user.dateOfBirth instanceof Date
    //             ? user.dateOfBirth.toISOString()
    //             : user.dateOfBirth
    //     }));

    //     try {
    //         await fs.writeFile(USERS_FILE_PATH, JSON.stringify(usersToSave, null, 2));
    //         this.logger.log(`Saved ${usersToSave.length} users to file`);
    //     } catch (error) {
    //         this.logger.error(`Error saving users file: ${error.message}`);
    //         throw error;
    //     }
    // }

    // // Get all users
    // async findAll(): Promise<User[]> {
    //     await this.init();
    //     return this.users;
    // }

    // // Find a user by ID
    // async findOne(id: string): Promise<User> {
    //     await this.init();

    //     const user = this.users.find(u => u.id === id);

    //     if (!user) {
    //         throw new NotFoundException(`User with ID ${id} not found`);
    //     }

    //     return user;
    // }

    // // Create a new user
    // async create(createUserData: CreateUserRequest): Promise<User> {
    //     await this.init();

    //     const newUser: User = {
    //         id: uuidv4(),
    //         name: createUserData.name,
    //         email: createUserData.email,
    //         gender: createUserData.gender,
    //         dateOfBirth: createUserData.dateOfBirth
    //             ? new Date(createUserData.dateOfBirth)
    //             : new Date('1990-01-15')
    //     };

    //     this.users.push(newUser);
    //     await this.saveUsers();

    //     return newUser;
    // }

    // // Update a user
    // async update(id: string, updateUserData: UpdateUserRequest): Promise<User> {
    //     await this.init();

    //     const userIndex = this.users.findIndex(u => u.id === id);

    //     if (userIndex === -1) {
    //         throw new NotFoundException(`User with ID ${id} not found`);
    //     }

    //     // Update the user
    //     const updatedUser = {
    //         ...this.users[userIndex],
    //         ...updateUserData,
    //         // Convert date string to Date object if provided
    //         dateOfBirth: updateUserData.dateOfBirth
    //             ? new Date(updateUserData.dateOfBirth)
    //             : this.users[userIndex].dateOfBirth
    //     };

    //     this.users[userIndex] = updatedUser;
    //     await this.saveUsers();

    //     return updatedUser;
    // }

    // // Delete a user
    // async remove(id: string): Promise<void> {
    //     await this.init();

    //     const userIndex = this.users.findIndex(u => u.id === id);

    //     if (userIndex === -1) {
    //         throw new NotFoundException(`User with ID ${id} not found`);
    //     }

    //     this.users.splice(userIndex, 1);
    //     await this.saveUsers();
    // }
}