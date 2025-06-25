import { Test, TestingModule } from '@nestjs/testing';
import { GeneratescriptController } from './generatescript.controller';

describe('GeneratescriptController', () => {
    let controller: GeneratescriptController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GeneratescriptController],
        }).compile();

        controller = module.get<GeneratescriptController>(GeneratescriptController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
