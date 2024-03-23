import { User } from '@prisma/client';
import { UserResponseDto } from './user.dto';

export const toJsonUser = (user: User): UserResponseDto => {
  const userResponseDto: UserResponseDto = {
    name: user.name,
    email: user.email,
    introduction: user.introduction,
    profilePhoto: user.profilePhoto,
  };

  return userResponseDto;
};

export const toJsonUsers = (users: User[]): UserResponseDto[] => {
  return users.map((user) => toJsonUser(user));
};
