import {
  CanActivate,
  ExecutionContext,
  GoneException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

const COMMERCE_PATHS = [
  /^\/(?:api\/v\d+\/)?(?:products|cart|orders|categories|brands)(?:\/|$)/,
  /^\/(?:api\/v\d+\/)?admin\/(?:products|orders)(?:\/|$)/,
  /^\/(?:api\/v\d+\/)?account\/orders(?:\/|$)/,
];

export function isCommerceApiPath(value: string): boolean {
  const pathname = value.split('?')[0].replace(/\/{2,}/g, '/');
  return COMMERCE_PATHS.some((pattern) => pattern.test(pathname));
}
@Injectable()
export class ServiceOnlyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    if (!this.config.get<boolean>('SERVICE_ONLY_MODE', true)) return true;

    const request = context.switchToHttp().getRequest<Request>();
    if (!isCommerceApiPath(request.originalUrl || request.url)) return true;

    throw new GoneException({
      code: 'COMMERCE_DISABLED',
      message: 'Chức năng bán sản phẩm không còn khả dụng ở chế độ dịch vụ thuần túy.',
    });
  }
}
