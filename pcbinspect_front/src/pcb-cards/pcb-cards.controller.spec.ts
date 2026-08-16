import { Test, TestingModule } from '@nestjs/testing';
import { PcbCardsController } from './pcb-cards.controller';

describe('PcbCardsController', () => {
  let controller: PcbCardsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PcbCardsController],
    }).compile();

    controller = module.get<PcbCardsController>(PcbCardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
