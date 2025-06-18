import { Test, TestingModule } from '@nestjs/testing';
import { ScriptGeneratorService } from './generatescript.service';

describe('GeneratescriptService', () => {
    let service: ScriptGeneratorService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ScriptGeneratorService],
        }).compile();

        service = module.get<ScriptGeneratorService>(ScriptGeneratorService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
