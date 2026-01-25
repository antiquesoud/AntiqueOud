import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Health check endpoint - for keep-alive pings
  @Get('health')
  async healthCheck() {
    return this.appService.healthCheck();
  }

  // Manual cache warming endpoint
  @Get('warm')
  async warmCache() {
    return this.appService.warmCache();
  }

  // Combined homepage data - single API call for all homepage data
  @Get('homepage')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // 5 minutes cache
  async getHomepageData() {
    return this.appService.getHomepageData();
  }
}
