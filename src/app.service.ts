import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user/user.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async checkDatabaseConnection(): Promise<string> {
    try {
      await this.userRepository.query('SELECT 1');
      return 'Database connection is healthy';
    } catch (error) {
      return `Database connection error: ${error.message}`;
    }
  }
}
