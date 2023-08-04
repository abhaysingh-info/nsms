import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { DiscordController } from './discord.controller';
import { DiscordUserService } from 'src/services/discord-user/discord-user.service';
import { MongooseModule } from '@nestjs/mongoose';
import DiscordUser, {
  DiscordUserSchema,
} from '@shared/models/DiscordUser.model';
import { ConfigService } from '@nestjs/config';
import { AttachDiscordUserMiddleware } from 'src/middlewares/attach-discord-user/attach-discord-user.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'DiscordUser',
        schema: DiscordUserSchema,
      },
    ]),
  ],
  controllers: [DiscordController],
  providers: [DiscordUserService, ConfigService],
})
export class DiscordModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AttachDiscordUserMiddleware)
      .exclude({ path: '/discord/login', method: RequestMethod.POST })
      .forRoutes('/discord', '/discord/*');
  }
}
