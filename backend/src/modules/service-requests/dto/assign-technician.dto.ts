import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class AssignTechnicianDto {
  @IsInt()
  @Min(1)
  requestVersion: number;

  @IsString()
  @IsNotEmpty({ message: 'Mã kỹ thuật viên không được để trống' })
  technicianId: string;
}
