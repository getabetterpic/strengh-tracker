import { Body, Controller, Post } from '@nestjs/common';
import { CreateUsersDTO } from '@strength-tracker/util';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService, private auth: AuthService) {}

  @Post()
  async create(@Body() body: CreateUsersDTO) {
    return this.users.create(body);
  }
}
