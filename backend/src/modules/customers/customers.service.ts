import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CustomerQueryDto } from './dto/customer-query.dto';

interface ServiceCustomerRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  serviceRequestCount: bigint | number;
  completedServiceCount: bigint | number;
  serviceRevenue: string | number;
  lastServiceAt: Date | null;
  createdAt: Date;
}

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: CustomerQueryDto) {
    const rows = await this.prisma.$queryRawUnsafe<ServiceCustomerRow[]>(
      `SELECT
         COALESCE(CAST(r.customerUserId AS CHAR), CONCAT('phone:', r.customerPhone)) AS id,
         COALESCE(MAX(NULLIF(CONCAT_WS(' ', u.firstName, u.lastName), '')), MAX(r.customerName), 'Khách hàng') AS name,
         MAX(r.customerPhone) AS phone,
         COALESCE(MAX(u.email), MAX(r.customerEmail), '') AS email,
         COUNT(DISTINCT r.id) AS serviceRequestCount,
         COUNT(DISTINCT CASE WHEN r.workflowStatus IN ('COMPLETED','CLOSED') THEN r.id END) AS completedServiceCount,
         COALESCE(SUM(payment.paidAmount), 0) AS serviceRevenue,
         MAX(r.createdAt) AS lastServiceAt,
         MIN(r.createdAt) AS createdAt
       FROM ServiceRequest r
       LEFT JOIN User u ON u.id = r.customerUserId
       LEFT JOIN (
         SELECT requestId, SUM(amount) AS paidAmount
         FROM ServicePaymentRecord
         WHERE status = 'COMPLETED'
         GROUP BY requestId
       ) payment ON payment.requestId = r.id
       GROUP BY COALESCE(CAST(r.customerUserId AS CHAR), CONCAT('phone:', r.customerPhone))`,
    );

    let customers = rows.map((row) => ({
      ...row,
      serviceRequestCount: Number(row.serviceRequestCount),
      completedServiceCount: Number(row.completedServiceCount),
      serviceRevenue: Number(row.serviceRevenue),
      lastServiceAt: row.lastServiceAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    }));

    const term = query?.q?.trim().toLocaleLowerCase('vi-VN');
    if (term) {
      customers = customers.filter(
        (customer) =>
          customer.name.toLocaleLowerCase('vi-VN').includes(term) ||
          customer.phone.includes(term) ||
          customer.email.toLocaleLowerCase('vi-VN').includes(term),
      );
    }

    const sortBy = query?.sortBy ?? 'lastServiceAt';
    const direction = query?.sortOrder?.toLowerCase() === 'asc' ? 1 : -1;
    customers.sort((left, right) => {
      const a = left[sortBy as keyof typeof left] ?? '';
      const b = right[sortBy as keyof typeof right] ?? '';
      return (
        (typeof a === 'number' && typeof b === 'number'
          ? a - b
          : String(a).localeCompare(String(b))) * direction
      );
    });

    const page = Math.max(1, query?.page ?? 1);
    const limit = Math.min(100, Math.max(1, query?.limit ?? 100));
    return {
      success: true,
      data: customers.slice((page - 1) * limit, page * limit),
      meta: {
        page,
        limit,
        total: customers.length,
        totalPages: Math.max(1, Math.ceil(customers.length / limit)),
      },
    };
  }
}
