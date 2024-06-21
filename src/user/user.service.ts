import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from '../role/role.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from 'src/user-role/user-role.entity';
import { UserResponseDto } from './user-response.dto';
import { UpdateUserDto } from './update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private dataSource: DataSource,
  ) {}

  private async getRolesAtOrBelow(role: Role): Promise<Role[]> {
    const getAllChildren = async (role: Role): Promise<Role[]> => {
      const children = await this.roleRepository.find({
        where: { parent: role },
      });
      return [
        role,
        ...(await Promise.all(
          children.map((child) => getAllChildren(child)),
        ).then((results) => results.flat())),
      ];
    };

    return getAllChildren(role);
  }

  async findAll(reqUser: User): Promise<UserResponseDto[]> {
    console.debug('Reached findAll method');
    console.debug(`Current User: ${JSON.stringify(reqUser)}`);
    const currentUser = await this.userRepository.findOne({
      where: { id: reqUser.id },
      relations: ['userRoles', 'userRoles.role'],
    });
    // Ensure userRoles is initialized
    if (!currentUser.userRoles || currentUser.userRoles.length === 0) {
      console.error('User has no roles assigned');
      return [];
    }

    const currentUserRoles = currentUser.userRoles.map((ur) => ur.role);
    console.debug(`Current User Roles: ${JSON.stringify(currentUserRoles)}`);

    const rolesAtOrBelow = await Promise.all(
      currentUserRoles.map((role) => this.getRolesAtOrBelow(role)),
    );

    console.debug(
      `Roles at or below current user roles: ${JSON.stringify(rolesAtOrBelow)}`,
    );

    const roleIds = rolesAtOrBelow.flat().map((role) => role.id);

    if (!roleIds || roleIds.length === 0) {
      console.error('No roles found at or below current user roles');
      return [];
    }

    console.debug(`Role IDs: ${JSON.stringify(roleIds)}`);

    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .where('userRoles.roleId IN (:...roleIds)', { roleIds })
      .getMany();

    if (!users || users.length === 0) {
      console.debug('No users found with the same role or below');
      return [];
    }

    return users.map((user) => this.toUserResponseDto(user));
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    });
    return this.toUserResponseDto(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['userRoles', 'userRoles.role'],
    });
    return this.toUserResponseDto(user);
  }

  async findEntityByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const user = new User();
      user.name = createUserDto.name;
      user.email = createUserDto.email;
      user.password = hashedPassword;

      const savedUser = await queryRunner.manager.save(user);

      for (const roleId of createUserDto.roleIds) {
        const role = await queryRunner.manager.findOne(Role, {
          where: { id: roleId },
        });
        if (role) {
          const userRole = new UserRole();
          userRole.user = savedUser;
          userRole.role = role;
          await queryRunner.manager.save(userRole);
        }
      }
      await queryRunner.commitTransaction();
      return this.toUserResponseDto(savedUser);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  private toUserResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.userRoles
        ? user.userRoles.map((userRole) => userRole.role)
        : [],
    };
  }
}
