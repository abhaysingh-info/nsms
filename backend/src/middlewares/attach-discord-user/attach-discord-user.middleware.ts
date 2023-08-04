import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { DiscordUserService } from 'src/services/discord-user/discord-user.service';
import { verifyJwtToken } from 'src/utils/utils';
import GetLogginToken from '../../utils/GetLogginToken';

@Injectable()
export class AttachDiscordUserMiddleware implements NestMiddleware {
  constructor(private discordService: DiscordUserService) {}

  async use(req: any, res: any, next: () => void) {
    const token = GetLogginToken(req);

    if (token) {
      const decoded = verifyJwtToken(token) as any;

      const discordUser = await this.discordService.get(decoded?.id);
      if (!discordUser) {
        throw new NotFoundException('Discord User not found!');
      }
      req.discordUser = discordUser;
    }

    next();
  }
}
