import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class Exercise {
  id?: string;
  @IsString()
  name!: string;
  @IsArray()
  sets!: Set[];
  @IsString()
  @IsOptional()
  workoutId!: string;
}

export class Set {
  @IsNumber()
  reps!: number;
  @IsNumber()
  weight!: number;
  @IsBoolean()
  completed!: boolean;
}

export class Workout {
  id?: string;
  @IsDateString()
  date!: string;
  @IsString()
  name!: string;

  @IsArray()
  exercises!: Exercise[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  completedAt?: string;
}
