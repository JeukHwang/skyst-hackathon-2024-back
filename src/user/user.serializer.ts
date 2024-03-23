import { User } from '@prisma/client';
import { UserResponseDto } from './user.dto';

export const toJsonUser = (user: User): UserResponseDto => {
  const userResponseDto: UserResponseDto = {
    id: user.id,
    name: user.name,
    introduction: user.introduction,
    profilePhoto: user.profilePhoto,
  };

  return userResponseDto;
};

export const toJsonUsers = (users: User[]): UserResponseDto[] => {
  return users.map((user) => toJsonUser(user));
};
