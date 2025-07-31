import { SelectUser, InsertUser } from '@strength-tracker/db';
import {
  IsArray,
  IsEmail,
  IsNumberString,
  IsOptional,
  IsPhoneNumber,
  IsString, MinLength
} from 'class-validator';

export class CreateUsersDTO implements InsertUser {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsNumberString()
  id?: number | undefined;

  @IsOptional()
  @IsString()
  name?: string | null | undefined;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsPhoneNumber('US')
  phoneNumber?: string | null | undefined;

  @IsArray()
  preferences?: unknown[];
}
