import { describe, it, expect, vi, beforeEach } from 'vitest';
import extractPdfText from '../../../configs/pdf.js';

// Since pdf-parse is a commonjs module loaded via createRequire, we mock it via vitest
vi.mock('module', () => {
  return {
    createRequire: () => vi.fn((moduleName: string) => {
      if (moduleName === 'pdf-parse') {
        return vi.fn().mockResolvedValue({ text: 'Mocked PDF Text' });
      }
      return vi.fn();
    })
  };
});

describe('PDF Extraction Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('extracts text correctly from a buffer', async () => {
    const mockBuffer = Buffer.from('mock pdf data');
    const text = await extractPdfText(mockBuffer);
    expect(text).toBe('Mocked PDF Text');
  });
});
