import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { SuperAdminStepUpGuard } from '../../common/guards/super-admin-step-up.guard';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [AuditLogController],
  providers: [AuditLogService, SuperAdminStepUpGuard],
  exports: [AuditLogService, SuperAdminStepUpGuard],
})
export class AuditLogModule {}
