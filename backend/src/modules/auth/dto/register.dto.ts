import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Juan Martelo' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '+573001234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CLIENTE })
  @IsEnum(UserRole)
  role: UserRole;
}
