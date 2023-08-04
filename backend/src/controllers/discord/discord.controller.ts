import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { IDiscord } from '@shared/interfaces/discord';
import { DiscordUserDocument } from '@shared/models/DiscordUser.model';
import { Response as IResponse, Response } from 'express';
import { CurrentDiscordUser } from 'src/decorators/CurrentDiscordUser.decorator';
import {
  CreateDiscordUserDto,
  UpdateWalletAddressDto,
} from 'src/dto/discord.dto';
import { AuthenticateDiscordGuard } from 'src/guards/authenticate-discord/authenticate-discord.guard';
import { DiscordUserService } from 'src/services/discord-user/discord-user.service';
import SetDiscordLogginToken from 'src/utils/SetDiscordLogginToken';

@Controller('discord')
export class DiscordController {
  constructor(private readonly discordUserService: DiscordUserService) {}

  @Get()
  async redirectToAuthUrl(@Res() res: Response) {
    return res.redirect(process.env.DISCORD_AUTH_URL);
  }

  @Post('login')
  async createOrGetUser(
    @Body() body: CreateDiscordUserDto,
    @Res({
      passthrough: true,
    })
    res: IResponse,
  ) {
    const user = await this.discordUserService.findOneAndUpdateOrCreate(
      body.code,
    );

    return SetDiscordLogginToken(res, user);
  }

  @Post('verify')
  @UseGuards(AuthenticateDiscordGuard)
  async verifyLoggin(
    @CurrentDiscordUser() user: DiscordUserDocument,
    @Res({
      passthrough: true,
    })
    res: IResponse,
  ) {
    return SetDiscordLogginToken(res, user as unknown as IDiscord);
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) res: IResponse) {
    res.clearCookie('token');
    res.clearCookie('roles');
    return { success: true };
  }
}
