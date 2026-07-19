import {
  PrismaClient,
  ServiceRequestPriority,
  ServiceRequestStatus,
  TechnicianStatus,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL || 'admin@dienlanh247.vn';
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error(
      'ADMIN_SEED_PASSWORD is required and must contain at least 12 characters',
    );
  }

  await prisma.user.upsert({
    where: { email },
    update: { password: await bcrypt.hash(password, 10), role: UserRole.ADMIN },
    create: {
      email,
      password: await bcrypt.hash(password, 10),
      firstName: 'Trưởng Kênh',
      lastName: 'Kỹ Thuật',
      role: UserRole.ADMIN,
    },
  });

  const staffEmail = process.env.STAFF_SEED_EMAIL?.trim().toLowerCase();
  const staffPassword = process.env.STAFF_SEED_PASSWORD;
  if (Boolean(staffEmail) !== Boolean(staffPassword)) {
    throw new Error('STAFF_SEED_EMAIL and STAFF_SEED_PASSWORD must be provided together');
  }
  if (staffEmail && staffPassword) {
    if (staffPassword.length < 12) {
      throw new Error('STAFF_SEED_PASSWORD must contain at least 12 characters');
    }
    await prisma.user.upsert({
      where: { email: staffEmail },
      update: { password: await bcrypt.hash(staffPassword, 10), role: UserRole.STAFF },
      create: {
        email: staffEmail,
        password: await bcrypt.hash(staffPassword, 10),
        firstName: 'Nhân viên',
        lastName: 'UAT',
        role: UserRole.STAFF,
      },
    });
  }

  const serviceCategories = [
    ['sua-dieu-hoa', 'Sửa điều hòa', 'Wind'],
    ['ve-sinh-dieu-hoa', 'Vệ sinh điều hòa', 'Droplets'],
    ['lap-dat-dieu-hoa', 'Lắp đặt điều hòa', 'Drill'],
    ['sua-tu-lanh', 'Sửa tủ lạnh', 'Snowflake'],
    ['sua-may-giat', 'Sửa máy giặt', 'WashingMachine'],
    ['bao-tri-dinh-ky', 'Bảo trì định kỳ', 'Wrench'],
  ] as const;
  for (const [id, name, icon] of serviceCategories) {
    await prisma.serviceCategory.upsert({
      where: { id },
      update: { name, slug: id, icon },
      create: { id, name, slug: id, icon },
    });
  }

  const technicians = [
    {
      id: 'TECH-001',
      name: 'Nguyễn Văn Hùng',
      phone: '0981112222',
      email: 'hung.nv@dienlanh247.vn',
      skills: ['sua-dieu-hoa', 've-sinh-dieu-hoa'],
      workingAreas: ['Quận Cầu Giấy', 'Quận Nam Từ Liêm'],
      rating: 4.8,
      status: TechnicianStatus.available,
    },
    {
      id: 'TECH-002',
      name: 'Trần Minh Hải',
      phone: '0982223333',
      email: 'hai.tm@dienlanh247.vn',
      skills: ['sua-tu-lanh', 'sua-may-giat'],
      workingAreas: ['Quận Đống Đa', 'Quận Thanh Xuân'],
      rating: 4.7,
      status: TechnicianStatus.available,
    },
    {
      id: 'TECH-003',
      name: 'Lê Hoàng Nam',
      phone: '0983334444',
      email: 'nam.lh@dienlanh247.vn',
      skills: ['sua-dieu-hoa', 'lap-dat-dieu-hoa'],
      workingAreas: ['Quận Ba Đình', 'Quận Tây Hồ'],
      rating: 4.9,
      status: TechnicianStatus.busy,
    },
  ];
  for (const technician of technicians) {
    await prisma.technician.upsert({
      where: { id: technician.id },
      update: technician,
      create: { ...technician, completedCount: 0 },
    });
  }

  // The two zero-valued shipping columns remain temporarily required by the
  // pre-contract Prisma schema. They are never returned or updated by the API.
  await prisma.systemSetting.upsert({
    where: { id: 'default' },
    update: {
      storeName: 'Điện Lạnh 247',
      hotline: '1900 1234',
      zalo: '0987654321',
      email: 'support@dienlanh247.vn',
      address: '123 Đường Cầu Giấy, Hà Nội',
    },
    create: {
      id: 'default',
      storeName: 'Điện Lạnh 247',
      hotline: '1900 1234',
      zalo: '0987654321',
      email: 'support@dienlanh247.vn',
      address: '123 Đường Cầu Giấy, Hà Nội',
      shippingFee: 0,
      freeShippingThreshold: 0,
    },
  });

  await prisma.serviceRequest.upsert({
    where: { id: 'SR-DEMO-001' },
    update: {},
    create: {
      id: 'SR-DEMO-001',
      customerName: 'Khách hàng mẫu',
      customerPhone: '0900000001',
      customerAddress: 'Quận Cầu Giấy, Hà Nội',
      district: 'Quận Cầu Giấy',
      priority: ServiceRequestPriority.medium,
      serviceCategoryId: 've-sinh-dieu-hoa',
      applianceType: 'Điều hòa treo tường',
      issueDescription: 'Yêu cầu bảo dưỡng định kỳ',
      preferredDate: '2026-07-20',
      preferredTimeSlot: '08:00 - 10:00',
      status: ServiceRequestStatus.confirmed,
      estimatedPrice: 250000,
      finalPrice: 0,
      paymentStatus: 'unpaid',
      statusHistory: [
        {
          status: 'confirmed',
          note: 'Dữ liệu demo service-only',
          updatedBy: 'seed',
        },
      ],
    },
  });

  console.log(
    'Service-only seed completed: no products, carts, orders, inventory or coupons were loaded.',
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
