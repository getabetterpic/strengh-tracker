import { Body, Controller, Post, Put, Req } from '@nestjs/common';
import {
  CreateUsersDTO,
  UpdateUserPreferencesDTO,
} from '@strength-tracker/util';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import { Public } from '../auth/public';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService, private auth: AuthService) {}

  @Public()
  @Post()
  async create(@Body() body: CreateUsersDTO) {
    return this.users.create(body);
  }

  @Put('preferences')
  async updatePreferences(
    @Req() req: Request,
    @Body() preferences: UpdateUserPreferencesDTO
  ) {
    return this.users.updatePreferences(req.user.userId, preferences);
  }
}
