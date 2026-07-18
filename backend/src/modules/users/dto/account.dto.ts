import {
  IsBoolean,
  IsInt,
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  lastName: string;

  @IsString()
  @Matches(/^(?:\+?84|0)(?:3|5|7|8|9)\d{8}$/, {
    message: 'Số điện thoại Việt Nam không hợp lệ',
  })
  phone: string;
}

export class CustomerRescheduleServiceRequestDto {
  @IsInt()
  @Min(1)
  requestVersion: number;

  @IsISO8601({ strict: true }, { message: 'Ngày mong muốn không hợp lệ' })
  preferredDate: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  preferredTimeSlot: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}

export class CustomerCancelServiceRequestDto {
  @IsInt()
  @Min(1)
  requestVersion: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  label: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName: string;

  @IsString()
  @Matches(/^(?:\+?84|0)(?:3|5|7|8|9)\d{8}$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  province: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  district: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  ward: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  streetAddress: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(10, { message: 'Mật khẩu mới phải có ít nhất 10 ký tự' })
  @MaxLength(128)
  @Matches(/[a-z]/, { message: 'Mật khẩu mới phải có chữ thường' })
  @Matches(/[A-Z]/, { message: 'Mật khẩu mới phải có chữ hoa' })
  @Matches(/[0-9]/, { message: 'Mật khẩu mới phải có chữ số' })
  newPassword: string;
}

export class ClaimServiceRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  code: string;

  @IsString()
  @Matches(/^(?:\+?84|0)(?:3|5|7|8|9)\d{8}$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  phone: string;
}

export class ServiceRequestReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}

export class PersonalDataRequestDto {
  @IsIn(['ACCESS', 'RECTIFY', 'DELETE', 'RESTRICT'])
  requestType: 'ACCESS' | 'RECTIFY' | 'DELETE' | 'RESTRICT';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
