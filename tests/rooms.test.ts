import { describe, it, expect } from 'vitest';

export function validateRoomCode(code: string): boolean {
  return /^MBG-\d{3,4}$/.test(code.trim().toUpperCase());
}

describe('Room Code Validation', () => {
  it('should accept valid room codes', () => {
    expect(validateRoomCode('MBG-123')).toBe(true);
    expect(validateRoomCode('mbg-999')).toBe(true);
  });

  it('should reject invalid room codes', () => {
    expect(validateRoomCode('')).toBe(false);
    expect(validateRoomCode('123')).toBe(false);
    expect(validateRoomCode('XYZ-999')).toBe(false);
  });
});
