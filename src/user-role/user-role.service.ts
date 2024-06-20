import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './user-role.entity';

@Injectable()
export class UserRoleService {
  constructor(
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  findAll(): Promise<UserRole[]> {
    return this.userRoleRepository.find();
  }

  findOne(id: number): Promise<UserRole> {
    return this.userRoleRepository.findOne({ where: { id } });
  }

  create(userRole: UserRole): Promise<UserRole> {
    return this.userRoleRepository.save(userRole);
  }

  async update(id: number, userRole: UserRole): Promise<UserRole> {
    await this.userRoleRepository.update(id, userRole);
    return this.userRoleRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.userRoleRepository.delete(id);
  }
}
