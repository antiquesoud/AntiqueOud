import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
      errorFormat: 'colorless',
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }

  async enableShutdownHooks(app: any) {
    this.$on('beforeExit' as never, async () => {
      await app.close();
    });
  }

  // Helper to handle connection errors gracefully
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
  ): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        // Only retry on connection errors
        if (error.code === 'P1001' || error.code === 'P1002') {
          this.logger.warn(`Connection error, retrying... (${i + 1}/${maxRetries})`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }
}
