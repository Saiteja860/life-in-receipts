import { describe, expect, it } from 'vitest';
import { RECEIPT_TYPES } from '@/constants';
import { validateDataset } from '@/lib/validate.js';
import { makeReceipt, TINY_CHAPTER_MAP } from './fixtures.js';

describe('dataset validation', () => {
  it('accepts a well-formed dataset', () => {
    const result = validateDataset([makeReceipt()]);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.receipts).toHaveLength(1);
  });

  it('rejects a non-array payload', () => {
    const result = validateDataset({ nope: true });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/expected an array/);
  });

  it('reports structural problems with the offending index and id', () => {
    const broken = [makeReceipt({ id: 'not-an-id' }), makeReceipt({ id: 'r002', ts: 'yesterday' })];
    const result = validateDataset(broken);
    expect(result.valid).toBe(false);
    expect(result.errors.join('\n')).toMatch(/invalid id/);
    expect(result.errors.join('\n')).toMatch(/malformed timestamp/);
  });

  it('rejects unknown receipt categories', () => {
    const result = validateDataset([makeReceipt({ type: 'telepathy' })]);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/unknown type/);
  });

  it('flags duplicate ids', () => {
    const result = validateDataset([makeReceipt(), makeReceipt()]);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/duplicate id/);
  });

  it('warns (without failing) about uncovered categories, missing tags and disorder', () => {
    const result = validateDataset(
      [makeReceipt({ tags: [] }), makeReceipt({ id: 'r002', ts: '2024-01-01T00:00:00' })],
      TINY_CHAPTER_MAP
    );
    expect(result.valid).toBe(true);
    expect(result.warnings.join(' ')).toMatch(/uncovered categories/);
    expect(result.warnings.join(' ')).toMatch(/no tags/);
    expect(result.warnings.join(' ')).toMatch(/not in chronological order/);
  });

  it('errors when a chapter map is supplied and an arc is orphaned', () => {
    const result = validateDataset([makeReceipt({ arc: 'a99' })], TINY_CHAPTER_MAP);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/arcs without chapters/);
  });

  it('keeps every required category in the constant list', () => {
    expect(RECEIPT_TYPES).toHaveLength(9);
    expect(new Set(RECEIPT_TYPES).size).toBe(9);
  });
});
