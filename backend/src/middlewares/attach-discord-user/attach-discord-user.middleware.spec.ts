import { AttachDiscordUserMiddleware } from './attach-discord-user.middleware';

describe('AttachDiscordUserMiddleware', () => {
  it('should be defined', () => {
    expect(new AttachDiscordUserMiddleware()).toBeDefined();
  });
});
