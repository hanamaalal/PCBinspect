import { Test, TestingModule } from '@nestjs/testing';
import { VerificationSnService } from './verification-sn.service';

describe('VerificationSnService', () => {
  let service: VerificationSnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VerificationSnService],
    }).compile();

    service = module.get<VerificationSnService>(VerificationSnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
