import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ADMIN_PERMISSIONS } from '../../common/auth/admin-permissions';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { AuditLogService } from './audit-log.service';

interface AuditIntegrityResponse {
  success: true;
  data: {
    valid: boolean;
    entriesChecked: number;
    firstBrokenId?: string;
  };
}

@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.SUPERADMIN)
@Permissions(ADMIN_PERMISSIONS.AUDIT_VIEW)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get('integrity')
  integrity(): AuditIntegrityResponse {
    return {
      success: true,
      data: this.auditLogService.verifyIntegrity(),
    };
  }

  @Get()
  listLogs(@Query() query: AuditLogQueryDto): Record<string, unknown> {
    return this.auditLogService.listAuditLogs(query);
  }
}
