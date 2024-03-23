import { Controller, Get, Post, Body } from '@nestjs/common';
import { User } from '@prisma/client';
import { Public } from 'src/auth/skip-auth.decorator';
import { CurrentUser } from './user.decorator';
import { UserProfile, UserService } from './user.service';
import { UserBodyDto, UserResponseDto } from './user.dto';
import { toJsonUser } from './user.serializer';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Get('all')
  async getAll(): Promise<UserProfile[]> {
    return await this.userService.findAllProfile();
  }

  @Get('')
  async getUser(@CurrentUser() user: User): Promise<UserResponseDto> {
    const userInfo = await this.userService.findById(user.id);
    return toJsonUser(userInfo);
  }

  @Post('')
  async postUser(
    @CurrentUser() user: User,
    @Body() userBody: UserBodyDto,
  ): Promise<UserResponseDto> {
    const userInfo = await this.userService.editProfile(user, userBody);
    return toJsonUser(userInfo);
  }

  @Get('list')
  async userList(@CurrentUser() user: User): Promise<UserProfile[]> {
    return this.userService.getUserList(user);
  }

  @Get('mailbox')
  async userMailbox(@CurrentUser() user: User): Promise<UserProfile> {
    return this.userService.getUserMailbox(user);
  }
}
