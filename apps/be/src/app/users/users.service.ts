import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DATABASE, users } from '@strength-tracker/db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateUsersDTO, LoginUserDto, UpdateUserPreferencesDTO } from '@strength-tracker/util';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE) private db: NodePgDatabase) {}

  async create(body: CreateUsersDTO) {
    const passwordDigest = await bcrypt.hash(body.password, 10);
    try {
      const [user] = await this.db
        .insert(users)
        .values({
          ...body,
          passwordDigest,
        })
        .returning({
          resourceId: users.resourceId,
          name: users.name,
          email: users.email,
          phoneNumber: users.phoneNumber,
          preferences: users.preferences,
        });
      return user;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async findOne(email: string) {
    const [user] = await this.db
      .select({
        resourceId: users.resourceId,
        email: users.email,
        name: users.name,
        phoneNumber: users.phoneNumber,
        preferences: users.preferences,
        passwordDigest: users.passwordDigest,
      })
      .from(users)
      .where(eq(users.email, email));
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  async updatePreferences(userId: string, preferences: UpdateUserPreferencesDTO) {
    try {
      const [user] = await this.db
        .update(users)
        .set({
          preferences: preferences,
        })
        .where(eq(users.resourceId, userId))
        .returning({
          resourceId: users.resourceId,
          email: users.email,
          name: users.name,
          phoneNumber: users.phoneNumber,
          preferences: users.preferences,
        });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
