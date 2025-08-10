import { Body, Controller, Post, Put, UseGuards, Request } from '@nestjs/common';
import { CreateUsersDTO, UpdateUserPreferencesDTO } from '@strength-tracker/util';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService, private auth: AuthService) {}

  @Post()
  async create(@Body() body: CreateUsersDTO) {
    return this.users.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('preferences')
  async updatePreferences(@Request() req, @Body() preferences: UpdateUserPreferencesDTO) {
    return this.users.updatePreferences(req.user.userId, preferences);
  }
}
