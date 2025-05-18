import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import {
    User,
    CreateUserRequest,
    UpdateUserRequest,
} from '@mono-forge/types';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<User> {
        return this.usersService.findOne(id);
    }

    @Post()
    async create(@Body() createUserDto: CreateUserRequest): Promise<User> {
        return this.usersService.create(createUserDto);

    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserRequest
    ): Promise<User> {
        return this.usersService.update(id, updateUserDto);

    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        await this.usersService.remove(id);
    }
}