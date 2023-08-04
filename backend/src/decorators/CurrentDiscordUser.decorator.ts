import {
  createParamDecorator,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';

export const CurrentDiscordUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!request.discordUser) {
      throw new NotFoundException('User not found!');
    }
    return request.discordUser;
  },
);
