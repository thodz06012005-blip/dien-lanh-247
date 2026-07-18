import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuditLogService } from '../audit/audit-log.service';
import {
  AddressDto,
  ChangePasswordDto,
  ClaimServiceRequestDto,
  CustomerCancelServiceRequestDto,
  CustomerRescheduleServiceRequestDto,
  PersonalDataRequestDto,
  ServiceRequestReviewDto,
  UpdateProfileDto,
} from './dto/account.dto';
import { UsersService } from './users.service';

interface AccountUser {
  userId: number;
  sessionId: string;
}

interface AccountApiResponse {
  success: boolean;
  message?: string;
  data: unknown;
}

@Controller('account')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get()
  async overview(
    @CurrentUser() user: AccountUser,
  ): Promise<AccountApiResponse> {
    return {
      success: true,
      data: await this.usersService.getOverview(user.userId),
    };
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: AccountUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<AccountApiResponse> {
    return {
      success: true,
      message: 'Cập nhật hồ sơ thành công',
      data: await this.usersService.updateProfile(user.userId, dto),
    };
  }

  @Get('addresses')
  async addresses(
    @CurrentUser() user: AccountUser,
  ): Promise<AccountApiResponse> {
    return {
      success: true,
      data: await this.usersService.listAddresses(user.userId),
    };
  }

  @Post('addresses')
  async createAddress(
    @CurrentUser() user: AccountUser,
    @Body() dto: AddressDto,
  ): Promise<AccountApiResponse> {
    return {
      success: true,
      message: 'Đã thêm địa chỉ',
      data: await this.usersService.createAddress(user.userId, dto),
    };
  }

  @Patch('addresses/:id')
  async updateAddress(
    @CurrentUser() user: AccountUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddressDto,
  ): Promise<AccountApiResponse> {
    return {
      success: true,
      message: 'Đã cập nhật địa chỉ',
      data: await this.usersService.updateAddress(user.userId, id, dto),
    };
  }

  @Delete('addresses/:id')
  async deleteAddress(
    @CurrentUser() user: AccountUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AccountApiResponse> {
    return {
      success: true,
      message: 'Đã xóa địa chỉ',
      data: await this.usersService.deleteAddress(user.userId, id),
    };
  }

  @Post('change-password')
  async changePassword(
    @CurrentUser() user: AccountUser,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccountApiResponse> {
    const data = await this.usersService.changePassword(user.userId, dto);
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
    return {
      success: true,
      message: 'Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.',
      data,
    };
  }

  @Get('service-requests')
  async serviceRequests(
    @CurrentUser() user: AccountUser,
  ): Promise<AccountApiResponse> {
    return {
      success: true,
      data: await this.usersService.listServiceRequests(user.userId),
    };
  }

  @Get('service-requests/:id')
  async serviceRequest(
    @CurrentUser() user: AccountUser,
    @Param('id') id: string,
  ): Promise<AccountApiResponse> {
    return {
      success: true,
      data: await this.usersService.getServiceRequest(user.userId, id),
    };
  }

  @Post('service-requests/claim')
  async claimServiceRequest(
    @CurrentUser() user: AccountUser,
    @Body() dto: ClaimServiceRequestDto,
  ): Promise<AccountApiResponse> {
    return {
      success: true,
      message: 'Yêu cầu dịch vụ đã được liên kết với tài khoản',
      data: await this.usersService.claimServiceRequest(user.userId, dto),
    };
  }

  @Post('service-requests/:id/review')
  async reviewServiceRequest(
    @CurrentUser() user: AccountUser,
    @Param('id') id: string,
    @Body() dto: ServiceRequestReviewDto,
  ): Promise<AccountApiResponse> {
    return {
      success: true,
      message: 'Cảm ơn bạn đã đánh giá dịch vụ',
      data: await this.usersService.reviewServiceRequest(user.userId, id, dto),
    };
  }

  @Patch('service-requests/:id/reschedule')
  async rescheduleServiceRequest(
    @CurrentUser() user: AccountUser,
    @Param('id') id: string,
    @Body() dto: CustomerRescheduleServiceRequestDto,
  ): Promise<AccountApiResponse> {
    return {
      success: true,
      message: 'Đã gửi lịch mong muốn mới; điều phối viên sẽ xác nhận lại.',
      data: await this.usersService.rescheduleServiceRequest(
        user.userId,
        id,
        dto,
      ),
    };
  }

  @Post('service-requests/:id/cancel')
  async cancelServiceRequest(
    @CurrentUser() user: AccountUser,
    @Param('id') id: string,
    @Body() dto: CustomerCancelServiceRequestDto,
  ): Promise<AccountApiResponse> {
    return {
      success: true,
      message: 'Yêu cầu đã được hủy.',
      data: await this.usersService.cancelServiceRequest(user.userId, id, dto),
    };
  }

  @Get('notifications')
  async notifications(
    @CurrentUser() user: AccountUser,
  ): Promise<AccountApiResponse> {
    return {
      success: true,
      data: await this.usersService.listNotifications(user.userId),
    };
  }

  @Patch('notifications/read-all')
  async readAllNotifications(
    @CurrentUser() user: AccountUser,
  ): Promise<AccountApiResponse> {
    return {
      success: true,
      data: await this.usersService.markAllNotificationsRead(user.userId),
    };
  }

  @Patch('notifications/:id/read')
  async readNotification(
    @CurrentUser() user: AccountUser,
    @Param('id') id: string,
  ): Promise<AccountApiResponse> {
    return {
      success: true,
      data: await this.usersService.markNotificationRead(
        user.userId,
        BigInt(id),
      ),
    };
  }

  @Get('sessions')
  async sessions(
    @CurrentUser() user: AccountUser,
  ): Promise<AccountApiResponse> {
    return {
      success: true,
      data: await this.usersService.listSessions(user.userId, user.sessionId),
    };
  }

  @Get('privacy/export')
  async privacyExport(
    @CurrentUser() user: AccountUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccountApiResponse> {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    const data = await this.usersService.exportPersonalData(user.userId);
    this.auditLogService.auditSuccess(
      req,
      'PERSONAL_DATA_EXPORTED',
      'privacy',
      String(user.userId),
      null,
      'Authenticated customer exported a personal data copy',
    );
    return {
      success: true,
      data,
    };
  }

  @Get('privacy/requests')
  async privacyRequests(
    @CurrentUser() user: AccountUser,
  ): Promise<AccountApiResponse> {
    return {
      success: true,
      data: await this.usersService.listPersonalDataRequests(user.userId),
    };
  }

  @Post('privacy/requests')
  async createPrivacyRequest(
    @CurrentUser() user: AccountUser,
    @Body() dto: PersonalDataRequestDto,
    @Req() req: Request,
  ): Promise<AccountApiResponse> {
    const data = await this.usersService.createPersonalDataRequest(
      user.userId,
      dto,
    );
    this.auditLogService.auditSuccess(
      req,
      'PERSONAL_DATA_REQUEST_CREATED',
      'privacy',
      data.id,
      { requestType: data.requestType },
      'Authenticated customer created a personal data request',
    );
    return {
      success: true,
      message: 'Yêu cầu quyền dữ liệu đã được tiếp nhận để xác minh và xử lý.',
      data,
    };
  }

  @Delete('sessions/:id')
  async revokeSession(
    @CurrentUser() user: AccountUser,
    @Param('id') id: string,
  ): Promise<AccountApiResponse> {
    return {
      success: true,
      message:
        id === user.sessionId
          ? 'Phiên hiện tại đã được thu hồi'
          : 'Phiên đăng nhập đã được thu hồi',
      data: await this.usersService.revokeSession(user.userId, id),
    };
  }
}
