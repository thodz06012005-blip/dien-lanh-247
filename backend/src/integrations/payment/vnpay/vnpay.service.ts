import { Injectable } from '@nestjs/common';
import { VNPay, ProductCode, VnpLocale } from 'vnpay';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VnpayService {
  private vnpay: VNPay;

  constructor(private configService: ConfigService) {
    this.vnpay = new VNPay({
      tmnCode: this.configService.get('VNPAY_TMN_CODE') || 'DEMO_TMN',
      secureSecret: this.configService.get('VNPAY_HASH_SECRET') || 'DEMO_SECRET',
      vnpayHost: 'https://sandbox.vnpayment.vn',
    });
  }

  createPaymentUrl(servicePaymentId: string, amount: number, ipAddr: string): string {
    return this.vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: servicePaymentId,
      vnp_OrderInfo: `Thanh toan dich vu ${servicePaymentId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: this.configService.get('VNPAY_RETURN_URL') || 'http://localhost:5173/payment-result',
      vnp_Locale: VnpLocale.VN,
    });
  }

  verifyIpn(query: Record<string, string>) {
    return this.vnpay.verifyIpnCall(query as any);
  }
}
