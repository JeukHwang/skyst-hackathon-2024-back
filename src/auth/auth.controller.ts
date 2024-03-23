import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { Response } from 'express';
import { UserProfile, UserService, toUserProfile } from 'src/user/user.service';
import { RegisterRequestDto } from './auth.dto';
import { AuthService } from './auth.service';
import { JwtRefreshGuard } from './guard/jwt-refresh.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { Public } from './skip-auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('signup')
  async signUp(@Body() userInfo: RegisterRequestDto): Promise<UserProfile> {
    return await this.authService.register(userInfo);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signIn(
    @Req() req: Request & { user: User },
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserProfile> {
    const user = req.user;
    const { accessToken, ...accessOption } =
      this.authService.getCookieWithJwtAccessToken(user.id);
    const { refreshToken, ...refreshOption } =
      this.authService.getCookieWithJwtRefreshToken(user.id);
    await this.userService.setRefreshToken(user.id, refreshToken);

    res
      .cookie('Authentication', accessToken, accessOption)
      .cookie('Refresh', refreshToken, refreshOption);
    return toUserProfile(user);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(@Req() req, @Res({ passthrough: true }) res: Response): void {
    const user = req.user;
    const { accessToken, ...accessOption } =
      this.authService.getCookieWithJwtAccessToken(user.id);

    res.cookie('Authentication', accessToken, accessOption).sendStatus(200);
  }

  @Post('signout')
  async signOut(
    @Req() req: Request & { user: User },
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { accessOption, refreshOption } =
      this.authService.getCookiesForSignOut();
    await this.userService.removeRefreshToken(req.user.id);

    res
      .cookie('Authentication', '', accessOption)
      .cookie('Refresh', '', refreshOption)
      .sendStatus(200);
  }
}
