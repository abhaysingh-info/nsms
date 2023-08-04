import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import DiscordUser, {
  DiscordUserSchema,
  DiscordUserDocument,
} from '@shared/models/DiscordUser.model';
import { Model } from 'mongoose';
import {
  ICreateDiscordUser,
  ITokenExchangeResponse,
} from '@shared/interfaces/discord';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import ControllerWrapper from 'src/utils/ControllerWrapper';

@Injectable()
export class DiscordUserService {
  constructor(
    @InjectModel('DiscordUser')
    private DiscordUserModel: Model<typeof DiscordUserSchema>,
    private configService: ConfigService,
  ) {}

  API_ENDPOINT = this.configService.get('DISCORD_API_ENDPOINT');
  CLIENT_ID = this.configService.get('DISCORD_CLIENT_ID');
  CLIENT_SECRET = this.configService.get('DISCORD_CLIENT_SECRET');
  REDIRECT_URI = this.configService.get('DISCORD_REDIRECT_URI');

  async create(discordUser: ICreateDiscordUser) {
    return await this.DiscordUserModel.create(discordUser);
  }

  async get(_discordId: string) {
    const user = await this.DiscordUserModel.findOne({
      discordId: `${_discordId}`,
    });
    return user;
  }

  async updateBanned(discordId: string, is_banned: boolean) {
    return await this.DiscordUserModel.updateOne(
      {
        discordId,
      },
      {
        is_banned,
      },
    );
  }

  async update(discordId: string, discordUser: ICreateDiscordUser) {
    return await this.DiscordUserModel.updateOne(
      {
        discordId,
      },
      {
        ...discordUser,
      },
    );
  }

  async delete(discordId: string): Promise<any> {
    return await this.DiscordUserModel.deleteOne({ discordId });
  }

  async findOneAndUpdateOrCreate(code: string) {
    return await ControllerWrapper(async () => {
      const { access_token, refresh_token } = await this.getExchangeCode(code);
      let user = await this.getUserDetailsFromDiscord(access_token);
      if (user) {
        user = JSON.parse(JSON.stringify(user));
        // check if user exists in db or not

        const discordUser: any = await this.get(user.id);
        if (!discordUser) {
          const reigsteredUser = await this.create({
            discordId: user.id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar || '/default.png',
            accessToken: access_token,
            refreshToken: refresh_token,
          });
          return reigsteredUser;
        } else {
          discordUser.accessToken = access_token;
          discordUser.refreshToken = refresh_token;
          if (user.username !== discordUser.username) {
            discordUser.username = user.username;
          }
          if (user.discriminator !== discordUser.discriminator) {
            discordUser.discriminator = user.discriminator;
          }
          if (user.avatar !== discordUser.avatar) {
            discordUser.avatar = user.avatar || '/default.png';
          }

          await discordUser.save();
          return discordUser;
        }
      } else {
        throw new InternalServerErrorException("failed to get user's details");
      }
    });
  }

  private async getExchangeCode(code: string): Promise<ITokenExchangeResponse> {
    const data = new URLSearchParams({
      client_id: this.CLIENT_ID,
      client_secret: this.CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.REDIRECT_URI,
    });

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const response = await axios.post<ITokenExchangeResponse>(
      `${this.API_ENDPOINT}/oauth2/token`,
      data.toString(),
      { headers },
    );

    return response.data;
  }

  private async getUserDetailsFromDiscord(accessToken: string) {
    try {
      const response = await axios.get(
        'https://discord.com/api/v10/users/@me',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new InternalServerErrorException("failed to get user's details");
    }
  }
}
