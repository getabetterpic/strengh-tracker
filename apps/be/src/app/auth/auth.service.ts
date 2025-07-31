import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { DATABASE, users } from '@strength-tracker/db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';

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
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
