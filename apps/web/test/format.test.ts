import { describe, it, expect } from 'vitest';
import { formatPrice } from '@/shared/lib/format';

const NBSP = '\u00A0';

describe('formatPrice', () => {
  it.each([
    { kopecks: 0, expected: `0${NBSP}₽` },
    { kopecks: 1, expected: `0,01${NBSP}₽` },
    { kopecks: 100, expected: `1${NBSP}₽` },
    { kopecks: 150, expected: `1,50${NBSP}₽` },
    { kopecks: 249000, expected: `2${NBSP}490${NBSP}₽` },
    { kopecks: 129050, expected: `1${NBSP}290,50${NBSP}₽` },
  ])('formatPrice($kopecks) → "$expected"', ({ kopecks, expected }) => {
    expect(formatPrice(kopecks)).toBe(expected);
  });
});
