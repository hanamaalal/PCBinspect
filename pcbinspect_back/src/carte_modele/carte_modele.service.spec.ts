import { Test, TestingModule } from '@nestjs/testing';
import { CarteModeleService } from './carte_modele.service';

describe('CarteModeleService', () => {
  let service: CarteModeleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarteModeleService],
    }).compile();

    service = module.get<CarteModeleService>(CarteModeleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
