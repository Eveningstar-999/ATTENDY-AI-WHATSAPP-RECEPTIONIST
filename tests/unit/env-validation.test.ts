// @vitest-environment node
// node not jsdom — jsdom makes @t3-oss skip server-var validation.
import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => vi.resetModules());

test('next.config wires env validation (throws on a missing required var)', async () => {
  const prevDb = process.env.DATABASE_URL;
  const prevSkip = process.env.SKIP_ENV_VALIDATION;
  delete process.env.DATABASE_URL;
  delete process.env.SKIP_ENV_VALIDATION;
  vi.resetModules();
  try {
    await expect(import('../../next.config')).rejects.toThrow(/Invalid environment variables/);
  } finally {
    if (prevDb !== undefined) process.env.DATABASE_URL = prevDb;
    if (prevSkip !== undefined) process.env.SKIP_ENV_VALIDATION = prevSkip;
  }
});

test('SKIP_ENV_VALIDATION bypasses validation', async () => {
  const prevDb = process.env.DATABASE_URL;
  const prevSkip = process.env.SKIP_ENV_VALIDATION;
  delete process.env.DATABASE_URL;
  process.env.SKIP_ENV_VALIDATION = '1';
  vi.resetModules();
  try {
    await expect(import('../../next.config')).resolves.toBeDefined();
  } finally {
    if (prevDb !== undefined) process.env.DATABASE_URL = prevDb;
    if (prevSkip === undefined) delete process.env.SKIP_ENV_VALIDATION;
    else process.env.SKIP_ENV_VALIDATION = prevSkip;
  }
});
