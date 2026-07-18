import { sanitizeForLog } from './redaction.util';

describe('privacy-safe log redaction', () => {
  it('redacts authentication, address, contact and image values recursively', () => {
    const sanitized = sanitizeForLog({
      token: 'secret-token',
      customerAddress: '123 private street',
      phone: '0900000000',
      email: 'private@example.com',
      images: ['https://example.com/private.jpg'],
      nested: { cookie: 'sid=secret' },
    });
    expect(JSON.stringify(sanitized)).not.toContain('secret-token');
    expect(JSON.stringify(sanitized)).not.toContain('private street');
    expect(JSON.stringify(sanitized)).not.toContain('0900000000');
    expect(JSON.stringify(sanitized)).not.toContain('private@example.com');
    expect(JSON.stringify(sanitized)).not.toContain('private.jpg');
  });
});
