/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsString, IsIn, IsNumber, IsOptional, IsEmail } from 'class-validator';

export class StakeDto {
  @IsString()
  public name: string;

  @IsNumber()
  public percent: number;
}

export class UpdateStakeDto {
  @IsNumber()
  public percent: number;
}

export class StakeholderDto {
  @IsString()
  public email: string;

  @IsString()
  public password: string;

  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  @IsString()
  public stake: string;

  @IsString()
  @IsOptional()
  public market: string;
}

export class StakeholderProfileDto {
  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;
}
export class StakeholderLoginDto {
  @IsEmail()
  public email: string;

  @IsString()
  public password: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  public email: string;
}

export class StakeholderResetDto {
  @IsString()
  public currentPassword: string;

  @IsString()
  public newPassword: string;
}

export class ConfirmCodeDto {
  @IsString()
  public code: string;

  @IsString()
  public newPassword: string;

  @IsEmail()
  public email: string;
}
