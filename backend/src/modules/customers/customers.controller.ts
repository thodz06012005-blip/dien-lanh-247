import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ADMIN_PERMISSIONS } from '../../common/auth/admin-permissions';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin/customers')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.STAFF)
@Permissions(ADMIN_PERMISSIONS.CUSTOMERS_VIEW)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@Query() query: CustomerQueryDto) {
    return this.customersService.findAll(query);
  }
}
