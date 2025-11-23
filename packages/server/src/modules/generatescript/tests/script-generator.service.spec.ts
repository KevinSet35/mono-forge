import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ScriptGeneratorInput } from '@mono-forge/types';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ScriptGeneratorService } from '../service/template/script-generator.service';
import { ScriptFileService } from '../service/template/script-file.service';
import { ScriptBuilderService } from '../service/template/script-builder.service';
import { IntegrationDataService } from '../service/template/integration-data.service';
import { ModuleResolverService } from '../service/template/module-resolver.service';

describe('ScriptGeneratorService - Exact Script Matching', () => {
    let service: ScriptGeneratorService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ScriptGeneratorService,
                ScriptFileService,
                ScriptBuilderService,
                IntegrationDataService,
                ModuleResolverService,
            ],
        }).compile();

        service = module.get<ScriptGeneratorService>(ScriptGeneratorService);
    });

    const getExpectedScript = async (filename: string): Promise<string> => {
        const expectedScriptPath = join(__dirname, '__fixtures__', 'expected-scripts', filename);
        try {
            return await fs.readFile(expectedScriptPath, 'utf-8');
        } catch (error) {
            throw new Error(`Expected script file not found: ${expectedScriptPath}. Please create this file with the expected output.`);
        }
    };

    describe('generateScriptWithData - Exact Output Matching', () => {
        it('should generate exact script for typescript + git integrations', async () => {
            // Arrange
            const input: ScriptGeneratorInput = {
                projectName: 'test-project',
                integrations: ['typescript', 'git'],
                advancedConfig: {
                    packageManager: 'npm',
                    nodeVersion: '18.x'
                },
                useAI: false,
            };

            // Act
            const result = await service.generateScriptWithData(input);

            // Assert
            const expectedScript = await getExpectedScript('typescript-git-npm-18x.sh');
            expect(result.script).toBe(expectedScript);
        });

        it('should generate exact script for minimal configuration', async () => {
            // Arrange
            const input: ScriptGeneratorInput = {
                projectName: 'minimal-project',
                integrations: ['typescript'],
                useAI: false,
            };

            // Act
            const result = await service.generateScriptWithData(input);

            // Assert
            const expectedScript = await getExpectedScript('typescript-only-defaults.sh');
            expect(result.script).toBe(expectedScript);
        });

        it('should generate exact script for multiple integrations with yarn', async () => {
            // Arrange
            const input: ScriptGeneratorInput = {
                projectName: 'multi-integration-project',
                integrations: ['typescript', 'git', 'docker', 'jest', 'eslint'],
                advancedConfig: {
                    packageManager: 'yarn',
                    nodeVersion: '20.x'
                },
                useAI: false,
            };

            // Act
            const result = await service.generateScriptWithData(input);

            // Assert
            const expectedScript = await getExpectedScript('multi-integrations-yarn-20x.sh');
            expect(result.script).toBe(expectedScript);
        });

        it('should generate exact script for no integrations', async () => {
            // Arrange
            const input: ScriptGeneratorInput = {
                projectName: 'base-project',
                integrations: [],
                advancedConfig: {
                    packageManager: 'pnpm',
                    nodeVersion: 'latest'
                },
                useAI: false,
            };

            // Act
            const result = await service.generateScriptWithData(input);

            // Assert
            const expectedScript = await getExpectedScript('no-integrations-pnpm-latest.sh');
            expect(result.script).toBe(expectedScript);
        });

        // Helper test to generate expected output files when they don't exist
        it.skip('should generate and save expected scripts (run manually to create fixtures)', async () => {
            const testCases = [
                {
                    input: {
                        projectName: 'test-project',
                        integrations: ['typescript', 'git'],
                        advancedConfig: { packageManager: 'npm', nodeVersion: '18.x' }
                    },
                    filename: 'typescript-git-npm-18x.sh'
                },
                {
                    input: {
                        projectName: 'minimal-project',
                        integrations: ['typescript']
                    },
                    filename: 'typescript-only-defaults.sh'
                },
                {
                    input: {
                        projectName: 'multi-integration-project',
                        integrations: ['typescript', 'git', 'docker', 'jest', 'eslint'],
                        advancedConfig: { packageManager: 'yarn', nodeVersion: '20.x' }
                    },
                    filename: 'multi-integrations-yarn-20x.sh'
                },
                {
                    input: {
                        projectName: 'base-project',
                        integrations: [],
                        advancedConfig: { packageManager: 'pnpm', nodeVersion: 'latest' }
                    },
                    filename: 'no-integrations-pnpm-latest.sh'
                }
            ];

            const fixturesDir = join(__dirname, '__fixtures__', 'expected-scripts');

            // Create fixtures directory if it doesn't exist
            try {
                await fs.mkdir(fixturesDir, { recursive: true });
            } catch (error) {
                // Directory might already exist
            }

            for (const testCase of testCases) {
                const result = await service.generateScriptWithData(testCase.input as ScriptGeneratorInput);
                const outputPath = join(fixturesDir, testCase.filename);
                await fs.writeFile(outputPath, result.script, 'utf-8');
                console.log(`Generated expected script: ${outputPath}`);
            }
        });
    });

    describe('Script Diff Testing (for debugging)', () => {
        it('should show detailed diff when scripts do not match', async () => {
            // This test helps debug differences when exact matching fails
            const input: ScriptGeneratorInput = {
                projectName: 'test-project',
                integrations: ['typescript', 'git'],
                advancedConfig: {
                    packageManager: 'npm',
                    nodeVersion: '18.x'
                },
                useAI: false,
            };

            const result = await service.generateScriptWithData(input);

            try {
                const expectedScript = await getExpectedScript('typescript-git-npm-18x.sh');

                if (result.script !== expectedScript) {
                    // Split into lines for easier comparison
                    const actualLines = result.script.split('\n');
                    const expectedLines = expectedScript.split('\n');

                    console.log('=== SCRIPT COMPARISON ===');
                    console.log(`Actual lines: ${actualLines.length}`);
                    console.log(`Expected lines: ${expectedLines.length}`);

                    // Find first difference
                    const maxLines = Math.max(actualLines.length, expectedLines.length);
                    for (let i = 0; i < maxLines; i++) {
                        const actualLine = actualLines[i] || '<MISSING>';
                        const expectedLine = expectedLines[i] || '<MISSING>';

                        if (actualLine !== expectedLine) {
                            console.log(`\nFirst difference at line ${i + 1}:`);
                            console.log(`Actual:   "${actualLine}"`);
                            console.log(`Expected: "${expectedLine}"`);
                            break;
                        }
                    }

                    // Save actual output for manual inspection
                    const debugOutputPath = join(__dirname, '__fixtures__', 'debug-actual-output.sh');
                    await fs.writeFile(debugOutputPath, result.script, 'utf-8');
                    console.log(`\nActual output saved to: ${debugOutputPath}`);
                }

                expect(result.script).toBe(expectedScript);
            } catch (error) {
                if (error.message.includes('Expected script file not found')) {
                    console.log('Expected script file not found. Run the fixture generation test first.');
                    // Save the actual output so you can use it as the expected output
                    const fixturesDir = join(__dirname, '__fixtures__', 'expected-scripts');
                    await fs.mkdir(fixturesDir, { recursive: true });
                    const outputPath = join(fixturesDir, 'typescript-git-npm-18x.sh');
                    await fs.writeFile(outputPath, result.script, 'utf-8');
                    console.log(`Generated initial expected script: ${outputPath}`);
                    console.log('Please review this file and run the test again.');
                }
                throw error;
            }
        });
    });
});