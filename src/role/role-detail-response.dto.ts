export class RoleDetailResponseDto {
  id: number;
  name: string;
  children: RoleDetailResponseDto[];
}