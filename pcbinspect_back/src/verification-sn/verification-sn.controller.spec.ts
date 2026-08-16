import { Test, TestingModule } from '@nestjs/testing';
import { VerificationSnController } from './verification-sn.controller';

describe('VerificationSnController', () => {
  let controller: VerificationSnController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificationSnController],
    }).compile();

    controller = module.get<VerificationSnController>(VerificationSnController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
