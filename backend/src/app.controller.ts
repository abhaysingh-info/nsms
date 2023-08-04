import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import DiscordUser, {
  DiscordUserDocument,
} from '@shared/models/DiscordUser.model';
import { User } from './entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      discordUser?: DiscordUserDocument;
      user?: User;
    }
  }
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/ping')
  works() {
    return {
      success: true,
      message: 'pong!',
    };
  }
}
