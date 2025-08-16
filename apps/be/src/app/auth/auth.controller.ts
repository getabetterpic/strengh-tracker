import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUsersDTO, LoginUserDto } from '@strength-tracker/util';
import { Public } from './public';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private setAuthCookie(res: Response, token: string) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'lax' : 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() signInDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { token } = await this.authService.login(
      signInDto.email,
      signInDto.password
    );
    this.setAuthCookie(res, token);
    return { ok: true };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(
    @Body() registerDto: CreateUsersDTO,
    @Res({ passthrough: true }) res: Response
  ) {
    const { token } = await this.authService.register(registerDto);
    this.setAuthCookie(res, token);
    return { ok: true };
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'lax' : 'lax',
      path: '/',
    });
    return { ok: true };
  }

  @Get('me')
  async me(@Req() req: Request) {
    // req.user is set by AuthGuard
    return req.user;
  }
}
