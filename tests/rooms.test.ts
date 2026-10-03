import { describe, it, expect } from 'vitest';

export function formatRoomCode(raw: string): string {
  const trimmed = raw.trim();
  return /^\d{3,4}$/.test(trimmed) ? `MBG-${trimmed}` : trimmed.toUpperCase();
}

export function validateRoomCode(code: string): boolean {
  const formatted = formatRoomCode(code);
  return /^MBG-\d{3,4}$/.test(formatted);
}

describe('Room Code Validation & Formatting', () => {
  it('should accept valid room codes', () => {
    expect(validateRoomCode('MBG-123')).toBe(true);
    expect(validateRoomCode('mbg-999')).toBe(true);
    expect(validateRoomCode('123')).toBe(true);
  });

  it('should format shorthand number codes to full MBG code', () => {
    expect(formatRoomCode('123')).toBe('MBG-123');
    expect(formatRoomCode('mbg-456')).toBe('MBG-456');
  });

  it('should reject invalid room codes', () => {
    expect(validateRoomCode('')).toBe(false);
    expect(validateRoomCode('XYZ-999')).toBe(false);
    expect(validateRoomCode('ABC')).toBe(false);
  });
});
