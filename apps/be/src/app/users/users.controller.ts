import { Body, Controller, Post, Put, UseGuards, Req } from '@nestjs/common';
import {
  CreateUsersDTO,
  UpdateUserPreferencesDTO,
} from '@strength-tracker/util';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService, private auth: AuthService) {}

  @Post()
  async create(@Body() body: CreateUsersDTO) {
    return this.users.create(body);
  }

  @UseGuards(AuthGuard)
  @Put('preferences')
  async updatePreferences(
    @Req() req: Request,
    @Body() preferences: UpdateUserPreferencesDTO
  ) {
    return this.users.updatePreferences(req.user.userId, preferences);
  }
}
