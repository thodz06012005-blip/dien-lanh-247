import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateDefaultSettings() {
    let settings = await this.prisma.systemSetting.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await this.prisma.systemSetting.create({
        data: {
          id: 'default',
          storeName: 'Điện Lạnh 247',
          hotline: '1900 1234',
          zalo: '0987654321',
          email: 'support@dienlanh247.vn',
          address: '123 Đường Cầu Giấy, Hà Nội',
        },
      });
    }

    return settings;
  }

  async getPublicSettings() {
    const settings = await this.getOrCreateDefaultSettings();
    return {
      success: true,
      data: {
        hotline: settings.hotline,
        zalo: settings.zalo,
        email: settings.email,
        address: settings.address,
      },
    };
  }

  async getAdminSettings() {
    const settings = await this.getOrCreateDefaultSettings();
    return {
      success: true,
      data: {
        id: settings.id,
        storeName: settings.storeName,
        hotline: settings.hotline,
        zalo: settings.zalo,
        email: settings.email,
        address: settings.address,
      },
    };
  }

  async updateSettings(dto: UpdateSettingsDto) {
    await this.getOrCreateDefaultSettings();

    const updated = await this.prisma.systemSetting.update({
      where: { id: 'default' },
      data: {
        storeName: dto.storeName,
        hotline: dto.hotline,
        zalo: dto.zalo,
        email: dto.email,
        address: dto.address,
      },
    });

    return {
      success: true,
      message: 'Cập nhật cài đặt hệ thống thành công',
      data: {
        id: updated.id,
        storeName: updated.storeName,
        hotline: updated.hotline,
        zalo: updated.zalo,
        email: updated.email,
        address: updated.address,
      },
    };
  }
}
