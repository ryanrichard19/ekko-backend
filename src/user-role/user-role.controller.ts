import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { UserRoleService } from './user-role.service';
import { UserRole } from './user-role.entity';

@Controller('user-roles')
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Get()
  findAll(): Promise<UserRole[]> {
    return this.userRoleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<UserRole> {
    return this.userRoleService.findOne(id);
  }

  @Post()
  create(@Body() userRole: UserRole): Promise<UserRole> {
    return this.userRoleService.create(userRole);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() userRole: UserRole,
  ): Promise<UserRole> {
    return this.userRoleService.update(id, userRole);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.userRoleService.remove(id);
  }
}
