import { IsEnum, IsOptional } from 'class-validator';

export enum WeightUnit {
  KG = 'kg',
  LBS = 'lbs',
}

export class UpdateUserPreferencesDTO {
  @IsEnum(WeightUnit)
  @IsOptional()
  weightUnit?: WeightUnit;
}
