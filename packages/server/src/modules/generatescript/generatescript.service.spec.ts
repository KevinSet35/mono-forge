import { Test, TestingModule } from '@nestjs/testing';
import { GeneratescriptService } from './generatescript.service';

describe('GeneratescriptService', () => {
  let service: GeneratescriptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeneratescriptService],
    }).compile();

    service = module.get<GeneratescriptService>(GeneratescriptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
