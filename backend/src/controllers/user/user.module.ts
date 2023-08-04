import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserService } from '../../services/user/user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../entities/user.entity';
import { AttachUserMiddleware } from 'src/middlewares/attach-user/attach-user.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AttachUserMiddleware)
      .exclude(
        '/user/login',
        {
          path: '/user',
          method: RequestMethod.POST,
        },
        {
          path: '/discord',
          method: RequestMethod.ALL,
        },
        {
          path: '/discord/*',
          method: RequestMethod.ALL,
        },
      )
      .forRoutes(
        '/user',
        '/user/*',
        '/nft',
        '/nft/*',
        '/planet',
        '/planet/*',
        '/mission',
        '/mission/*',
      );
  }
}
