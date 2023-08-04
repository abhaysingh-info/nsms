import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UnauthorizedException,
  Res,
  UseInterceptors,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { UserService } from '../../services/user/user.service';
import { CreateUserDto } from '../../dto/user/create-user.dto';
import { UpdateUserDto } from '../../dto/user/update-user.dto';
import { LoginUserDto } from '../../dto/user/login-user.dto';
import SetLogginToken from 'src/utils/SetLogginToken';
import { Request, Response } from 'express';
// import { AttachUserInterceptor } from 'src/interceptors/attach-user/attach-user.interceptor';
import { AuthenticateGuard } from 'src/guards/authenticate/authenticate.guard';
import { CurrentUser } from 'src/decorators/CurrentUser.decorator';
import { User, UserDocument } from 'src/entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    if (user) {
      return {
        success: true,
        message: 'Congratulations Created Successfully!',
      };
    } else {
      return {
        success: false,
        message: 'We are sorry, there was an error while creating your account',
      };
    }
  }

  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.userService.findOneByEmail(
      loginUserDto.email,
      true,
    );

    if (!user) {
      throw new NotFoundException(
        `User with email ${loginUserDto.email} not found!`,
      );
    }

    const doesProvidedPasswordMatchUserPassword: boolean =
      await user.comparePassword(loginUserDto.password);

    if ((user.passwordTries as number) >= 5) {
      throw new UnauthorizedException(
        'Your account is Blocked please check your email for further instructions or request a password reset!',
      );
    }

    if (!doesProvidedPasswordMatchUserPassword) {
      user.passwordTries = ((user.passwordTries as number) + 1) as Number;
      if ((user.passwordTries as number) >= 5) {
        user.isBlocked = true;
      }
      await user.save();

      throw new UnauthorizedException(
        'Email or password you entered is incorrect!',
      );
    } else {
      user.passwordTries = 0;
      await user.save();
    }

    if (user.isBlocked) {
      throw new UnauthorizedException(
        'Your account is Blocked please check your email for further instructions or request a password reset!',
      );
    }

    if (user.suspended) {
      throw new UnauthorizedException(
        'Your account is suspended, if you think this was a mistake please contact our support',
      );
    }

    return await SetLogginToken(res, user);
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token');
    res.clearCookie('roles');
    return { success: true };
  }

  @Post('login/verify')
  @UseGuards(AuthenticateGuard)
  async verifyLoggin(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: UserDocument,
  ) {
    if (user?._id) {
      let data = { ...(await SetLogginToken(res, user)), success: true };
      return data;
    }
    res.clearCookie('token');
    res.clearCookie('roles');
    return { success: false };
  }

  @Patch()
  @UseGuards(AuthenticateGuard)
  update(
    @CurrentUser() user: UserDocument,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(user._id.toString(), updateUserDto);
  }

  @Delete()
  @UseGuards(AuthenticateGuard)
  remove(@CurrentUser() user: UserDocument) {
    return this.userService.remove(user._id.toString());
  }
}
