import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { RoleResponseDto } from './role-response.dto';
import { CreateRoleDto } from './create-role.dto';
import { RoleDetailResponseDto } from './role-detail-response.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<RoleResponseDto[]> {
    const roles = await this.roleRepository.find();
    return roles.map((role) => ({ id: role.id, name: role.name }));
  }

  async findOneWithHierarchy(id: number): Promise<RoleDetailResponseDto> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['children'],
    });
    if (!role) {
      throw new Error('Role not found');
    }
    const buildTree = async (role: Role): Promise<RoleDetailResponseDto> => {
      const children = await this.roleRepository.find({
        where: { parent: role },
        relations: ['children'],
      });
      return {
        id: role.id,
        name: role.name,
        children: await Promise.all(children.map(buildTree)),
      };
    };
    return buildTree(role);
  }

  async findOne(id: number): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findOne({ where: { id } });
    return { id: role.id, name: role.name };
  }

  async create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const existingRole = await this.roleRepository
      .createQueryBuilder('role')
      .where('LOWER(role.name) = LOWER(:name)', { name: createRoleDto.name })
      .getOne();

    if (existingRole) {
      throw new Error('Role with this name already exists');
    }

    const role = new Role();
    role.name = createRoleDto.name;

    if (createRoleDto.parentId) {
      const parentRole = await this.roleRepository.findOne({
        where: { id: createRoleDto.parentId },
      });
      if (parentRole) {
        role.parent = parentRole;
      }
    }

    const savedRole = await this.roleRepository.save(role);
    return { id: savedRole.id, name: savedRole.name };
  }

  async remove(id: number): Promise<void> {
    await this.roleRepository.delete(id);
  }
}
