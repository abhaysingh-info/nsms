import { Test, TestingModule } from '@nestjs/testing';
import { DiscordUserService } from './discord-user.service';

describe('DiscordUserService', () => {
  let service: DiscordUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordUserService],
    }).compile();

    service = module.get<DiscordUserService>(DiscordUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
