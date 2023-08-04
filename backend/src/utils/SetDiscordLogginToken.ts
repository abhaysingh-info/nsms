import { Response } from 'express';
import { IDiscord } from '@shared/interfaces/discord';

export default async function (res: Response, discordUser: IDiscord) {
  const token: string = discordUser.getJwtToken();
  res.cookie('token', token);

  return {
    token,
    user: {
      avatar: discordUser.avatar,
      discordId: discordUser.discordId,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      connected_wallet_address: discordUser.connected_wallet_address
        ? discordUser.connected_wallet_address
        : '',
      is_banned: discordUser.is_banned,
    },
  };
}
