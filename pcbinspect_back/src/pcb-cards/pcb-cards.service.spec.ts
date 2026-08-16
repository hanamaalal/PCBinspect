import { Test, TestingModule } from '@nestjs/testing';
import { PcbCardsService } from './pcb-cards.service';

describe('PcbCardsService', () => {
  let service: PcbCardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PcbCardsService],
    }).compile();

    service = module.get<PcbCardsService>(PcbCardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
