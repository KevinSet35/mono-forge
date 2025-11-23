import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClaudeClientService } from './claude-client.service';

@Module({
    imports: [ConfigModule],
    providers: [ClaudeClientService],
    exports: [ClaudeClientService],
})
export class ClaudeClientModule { }