/** @see https://github.com/auth0/node-jsonwebtoken */
/** @see https://velog.io/@wlduq0150/Nest.js06.-JWT-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EA%B5%AC%ED%98%84 */

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import { UserService, toUserProfile } from 'src/user/user.service';
import { RegisterRequestDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(name: string, password: string): Promise<User | null> {
    const user = await this.userService.findByName(name);
    if (!user) return null;
    const isValid: boolean = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async register(userInfo: RegisterRequestDto) {
    const hashedPassword = await bcrypt.hash(userInfo.password, 10);
    const user = await this.userService.create({
      ...userInfo,
      password: hashedPassword,
    });
    return toUserProfile(user);
  }

  async issueAccessToken(user: User) {
    return {
      access_token: this.jwtService.sign({ id: user.id, name: user.name }),
    };
  }

  getCookieWithJwtAccessToken(id: string) {
    const payload = { id };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: `${process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME}s`,
    });
    return {
      accessToken: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      maxAge: Number(process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME) * 1000,
    };
  }

  getCookieWithJwtRefreshToken(id: string) {
    const payload = { id };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: `${process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME}s`,
    });

    return {
      refreshToken: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      maxAge: Number(process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME) * 1000,
    };
  }

  getCookiesForSignOut() {
    return {
      accessOption: {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 0,
      },
      refreshOption: {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 0,
      },
    };
  }
}
