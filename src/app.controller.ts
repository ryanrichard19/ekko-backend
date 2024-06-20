import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/health/db')
  async getDatabaseHealth(): Promise<string> {
    return this.appService.checkDatabaseConnection();
  }

  @Get('/')
  getHello(): string {
    return 'Hello World!';
  }
}
