import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { DATABASE, users } from '@strength-tracker/db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { CreateUsersDTO } from '@strength-tracker/util';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE) private db: NodePgDatabase,
    private jwtService: JwtService
  ) {}

  async login(email: string, password: string) {
    const [firstRow] = await this.db
      .select({
        passwordDigest: users.passwordDigest,
        resourceId: users.resourceId,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.email, email));
    const { passwordDigest, ...user } = firstRow;
    const passwordsMatch = await bcrypt.compare(password, passwordDigest || '');
    if (!passwordsMatch) {
      throw new UnauthorizedException();
    }

    const payload = {
      sub: user.resourceId,
      email: user.email,
      name: user.name,
    };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }

  async register(body: CreateUsersDTO) {
    const { password, email, phoneNumber, name } = body;
    const passwordDigest = await bcrypt.hash(password, 10);

    try {
      const [user] = await this.db
        .insert(users)
        .values({ email, phoneNumber, passwordDigest, name })
        .returning({
          id: users.resourceId,
          email: users.email,
          name: users.name,
        });
      const payload = {
        sub: user.id,
        email: user.email,
        name: user.name,
      };
      return {
        token: await this.jwtService.signAsync(payload),
      };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
