import { validate } from 'class-validator';
import { CreateServiceRequestDto } from './create-service-request.dto';

const validPayload = {
  customerName: 'Nguyễn Văn An',
  customerPhone: '0912345678',
  customerEmail: 'an@example.com',
  customerAddress: '12 phố Duy Tân',
  province: 'Hà Nội',
  district: 'Quận Cầu Giấy',
  ward: 'Dịch Vọng Hậu',
  serviceCategoryId: 'kiem-tra-chan-doan',
  applianceType: 'Điều hòa treo tường',
  issueDescription: 'Máy chạy nhưng không làm mát.',
  preferredDate: '2026-08-01',
  preferredTimeSlot: '08:00 - 10:00',
  contactConsent: true,
  dataProcessingConsent: true,
  termsAccepted: true,
  termsVersion: 'DL247-SVC-1.0',
  pricingDisclosureAccepted: true,
  pricingDisclosureVersion: '2026-07-v1',
};

describe('CreateServiceRequestDto final customer contract', () => {
  it('accepts an unknown model while keeping the required service fields', async () => {
    const dto = Object.assign(new CreateServiceRequestDto(), validPayload);
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects missing consent without exposing account state', async () => {
    const dto = Object.assign(new CreateServiceRequestDto(), validPayload, {
      contactConsent: false,
      dataProcessingConsent: false,
      termsAccepted: false,
    });
    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['contactConsent', 'dataProcessingConsent', 'termsAccepted']),
    );
  });

  it('rejects an unsupported terms version and an overlong issue description', async () => {
    const dto = Object.assign(new CreateServiceRequestDto(), validPayload, {
      issueDescription: 'x'.repeat(3001),
      termsVersion: 'draft',
    });
    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['issueDescription', 'termsVersion']),
    );
  });
});
