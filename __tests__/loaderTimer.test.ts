import { LOADER_DURATION_MS } from '../src/constants/config';

describe('splash hold', () => {
  it('holds for exactly the product contract of 8000 ms', () => {
    expect(LOADER_DURATION_MS).toBe(8000);
  });

  it('is long enough for the review capture to reach its first frame', () => {
    expect(LOADER_DURATION_MS).toBeGreaterThanOrEqual(6000);
  });
});
