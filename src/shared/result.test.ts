import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, ok } from './result';

describe('result helpers', () => {
  it('wraps a successful value', () => {
    const result = ok('saved');

    expect(result.ok).toBe(true);
    expect(result.value).toBe('saved');
    expect(isOk(result)).toBe(true);
    expect(isErr(result)).toBe(false);
  });

  it('wraps a failed value', () => {
    const error = new Error('save failed');
    const result = err(error);

    expect(result.ok).toBe(false);
    expect(result.error).toBe(error);
    expect(isOk(result)).toBe(false);
    expect(isErr(result)).toBe(true);
  });
});
