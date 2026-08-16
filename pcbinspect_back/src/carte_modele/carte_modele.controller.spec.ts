import { Test, TestingModule } from '@nestjs/testing';
import { CarteModeleController } from './carte_modele.controller';

describe('CarteModeleController', () => {
  let controller: CarteModeleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarteModeleController],
    }).compile();

    controller = module.get<CarteModeleController>(CarteModeleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
