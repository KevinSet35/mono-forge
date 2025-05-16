import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
  ];

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User {
    return this.users.find(user => user.id === id);
  }
}
