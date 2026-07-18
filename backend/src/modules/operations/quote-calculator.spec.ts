import type { CreateQuoteDto } from './dto/operations.dto';
import { calculateQuote } from './quote-calculator';

describe('calculateQuote', () => {
  it('preserves labor and material lines with deterministic totals', () => {
    const result = calculateQuote({
      lines: [
        {
          lineType: 'LABOR',
          description: 'Công sửa chữa',
          quantity: 1,
          unit: 'lần',
          unitPrice: 350000,
          sortOrder: 0,
        },
        {
          lineType: 'MATERIAL',
          description: 'Tụ thay thế',
          quantity: 2,
          unit: 'cái',
          unitPrice: 125000,
          sortOrder: 1,
        },
      ],
      discountType: 'FIXED',
      discountValue: 50000,
      taxRate: 0,
    } as CreateQuoteDto);

    expect(result.laborSubtotal).toBe(350000);
    expect(result.materialSubtotal).toBe(250000);
    expect(result.totalAmount).toBe(550000);
    expect(result.lines.map((line) => line.lineType)).toEqual([
      'LABOR',
      'MATERIAL',
    ]);
  });

  it('rejects an empty quotation', () => {
    expect(() =>
      calculateQuote({ lines: [] } as unknown as CreateQuoteDto),
    ).toThrow('ít nhất một dòng');
  });
});
