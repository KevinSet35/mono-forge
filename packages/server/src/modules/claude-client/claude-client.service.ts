import Anthropic from '@anthropic-ai/sdk';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClaudeClientService {
    private static readonly ENV_API_KEY = 'ANTHROPIC_API_KEY';
    private static readonly ENV_MODEL = 'CLAUDE_MODEL';
    private static readonly ENV_MAX_TOKENS = 'CLAUDE_MAX_TOKENS';
    private static readonly DEFAULT_MODEL = 'claude-sonnet-4-20250514';
    private static readonly DEFAULT_MAX_TOKENS = 8000;

    private anthropic: Anthropic;
    private model: string;
    private maxTokens: number;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>(ClaudeClientService.ENV_API_KEY);

        if (!apiKey) {
            throw new Error(`${ClaudeClientService.ENV_API_KEY} is not defined in environment variables`);
        }

        this.anthropic = new Anthropic({
            apiKey,
        });
        this.model = this.configService.get<string>(
            ClaudeClientService.ENV_MODEL,
            ClaudeClientService.DEFAULT_MODEL
        );

        // Parse max_tokens as integer since env vars are always strings
        const maxTokensEnv = this.configService.get<string>(ClaudeClientService.ENV_MAX_TOKENS);
        this.maxTokens = maxTokensEnv
            ? parseInt(maxTokensEnv, 10)
            : ClaudeClientService.DEFAULT_MAX_TOKENS;
    }

    async chat(systemMessage: string, userMessage: string): Promise<string> {
        console.log('-max_tokens', this.maxTokens);
        try {
            const message = await this.anthropic.messages.create({
                model: this.model,
                max_tokens: this.maxTokens,
                system: systemMessage,
                messages: [
                    {
                        role: 'user',
                        content: userMessage,
                    },
                ],
            });

            // Extract text content
            const textBlocks = message.content
                .filter((block): block is Anthropic.TextBlock => block.type === 'text')
                .map(block => block.text)
                .join('\n');

            return textBlocks;
        } catch (error) {
            console.error('Error calling Claude API:', error);
            throw error;
        }
    }

    // Optional: Method to update model
    setModel(model: string): void {
        this.model = model;
    }

    // Optional: Method to update max tokens
    setMaxTokens(maxTokens: number): void {
        this.maxTokens = maxTokens;
    }
}

// // Usage
// const claude = new ClaudeClient();
// claude.chat('Explain TypeScript generics').then(console.log);

// // Or with custom configuration
// const customClaude = new ClaudeClient(
//     'your-api-key',
//     'claude-sonnet-4-20250514',
//     4096
// );
// customClaude.chat('Hello!').then(console.log);