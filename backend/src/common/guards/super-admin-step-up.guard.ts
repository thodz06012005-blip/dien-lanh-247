import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { AuditLogService } from '../../modules/audit/audit-log.service';

interface StepUpClaims {
  sub: number;
  sid: string;
  role: string;
  purpose: string;
}

function readCookie(header: string | undefined, name: string) {
  for (const part of header?.split(';') ?? []) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) {
      const encoded = value.join('=');
      try {
        return decodeURIComponent(encoded);
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

@Injectable()
export class SuperAdminStepUpGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<
      Request & {
        user?: { userId?: number; sessionId?: string; role?: string };
      }
    >();
    const token = readCookie(request.headers.cookie, 'adminStepUpToken');
    try {
      if (!token || request.user?.role !== 'SUPERADMIN')
        throw new Error('missing step-up');
      const verifier = new JwtService();
      const claims = await verifier.verifyAsync<StepUpClaims>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        audience: 'dien-lanh-247-admin',
        issuer: 'dien-lanh-247-api',
      });
      if (
        claims.purpose !== 'admin-step-up' ||
        claims.role !== 'SUPERADMIN' ||
        Number(claims.sub) !== Number(request.user.userId) ||
        claims.sid !== request.user.sessionId
      ) {
        throw new Error('invalid step-up binding');
      }
      return true;
    } catch {
      this.auditLogService.auditDenied(
        request,
        'SUPERADMIN_STEP_UP_REQUIRED',
        request.path,
        String(request.user?.userId ?? 'none'),
        null,
        'Fresh Super Admin verification required',
      );
      throw new ForbiddenException({
        success: false,
        code: 'SUPERADMIN_STEP_UP_REQUIRED',
        message:
          'Vui lòng xác minh lại mật khẩu Super Admin trước thao tác nhạy cảm.',
      });
    }
  }
}
