import {
  Injectable,
  NestMiddleware,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from 'src/services/user/user.service';
import { User } from 'src/entities/user.entity';
import GetLogginToken from 'src/utils/GetLogginToken';
import { verifyJwtToken } from 'src/utils/utils';

@Injectable()
export class AttachUserMiddleware implements NestMiddleware {
  constructor(private userService: UserService) {}

  async use(req: any, res: any, next: () => void) {
    const token = GetLogginToken(req);

    if (token) {
      const decoded = verifyJwtToken(token) as any;
      const user = await this.userService.findOneByEmail(decoded?.email);
      if (!user) {
        throw new NotFoundException('User not found!');
      }
      if (user.isBlocked) {
        throw new ForbiddenException(
          'Your account is temprorary blocked, please check your e-mail associated with the account',
        );
      }
      if (user.suspended) {
        throw new ForbiddenException(
          'Your account is permanentaly suspended please contact our support.',
        );
      }
      req.user = user;
    }
    next();
  }
}
