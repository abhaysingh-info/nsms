import { AuthenticateDiscordGuard } from './authenticate-discord.guard';

describe('AuthenticateDiscordGuard', () => {
  it('should be defined', () => {
    expect(new AuthenticateDiscordGuard()).toBeDefined();
  });
});
