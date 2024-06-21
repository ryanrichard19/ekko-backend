import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './create-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleResponseDto } from './role-response.dto';
import { RoleDetailResponseDto } from './role-detail-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  findAll(): Promise<RoleResponseDto[]> {
    return this.roleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<RoleDetailResponseDto> {
    return this.roleService.findOneWithHierarchy(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    return this.roleService.create(createRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.roleService.remove(id);
  }
}
