import { BadRequestException } from '@nestjs/common';
import { SafeImageFilesPipe, assertSafeImageMetadata } from './safe-image-files.pipe';

function imageFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  return {
    fieldname: 'files',
    originalname: 'hien-trang.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: buffer.length,
    buffer,
    destination: '',
    filename: '',
    path: '',
    stream: undefined as never,
    ...overrides,
  };
}

describe('SafeImageFilesPipe', () => {
  it('accepts a whitelisted image whose magic bytes match its declaration', () => {
    const file = imageFile();
    expect(new SafeImageFilesPipe().transform([file])).toEqual([file]);
  });

  it('rejects a spoofed image even when MIME type and extension look valid', () => {
    const file = imageFile({ buffer: Buffer.from('<script>alert(1)</script>'), size: 25 });
    expect(() => new SafeImageFilesPipe().transform([file])).toThrow(BadRequestException);
  });

  it('rejects dangerous inner extensions before storage', () => {
    const file = imageFile({ originalname: 'payload.php.png' });
    expect(() => assertSafeImageMetadata(file)).toThrow('phần mở rộng không an toàn');
  });

  it('rejects an oversized image before provider upload', () => {
    const file = imageFile({ size: 5 * 1024 * 1024 + 1 });
    expect(() => assertSafeImageMetadata(file)).toThrow('không vượt quá 5 MB');
  });
});
