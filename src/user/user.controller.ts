import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserResponseDto } from './user-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(@Req() req: any): Promise<UserResponseDto[]> {
    const currentUser = req.user as User;
    console.log('reached here');
    console.log(currentUser);
    return this.userService.findAll(currentUser);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() user: User,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, user);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.userService.remove(id);
  }
}
