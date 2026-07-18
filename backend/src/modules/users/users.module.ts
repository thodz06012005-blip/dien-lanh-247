import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuditLogModule } from '../audit/audit-log.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [AuthModule, AuditLogModule],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
