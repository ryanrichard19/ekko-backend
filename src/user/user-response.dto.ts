import { Role } from 'src/role/role.entity';

export class UserResponseDto {
  id: number;
  name: string;
  email: string;
  roles: Role[];
}
