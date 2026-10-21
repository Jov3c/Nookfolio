import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);

describe('transitive dependency security patches', () => {
  it('rejects brace expressions deeper than the supported limit', () => {
    const braces = require('braces') as (pattern: string) => string[];
    const deeplyNested = `${'{'.repeat(101)}a,b${'}'.repeat(101)}`;

    expect(() => braces(deeplyNested)).toThrow(/exceeds max depth/);
  });

  it('validates the nested RSA DigestAlgorithm element count', () => {
    const forgeEntry = require.resolve('node-forge');
    const rsaSource = readFileSync(
      require.resolve('node-forge/lib/rsa.js', { paths: [forgeEntry] }),
      'utf8',
    );

    expect(rsaSource).toContain('obj.value[0].value.length !==');
    expect(rsaSource).toContain("(('parameters' in capture) ? 2 : 1)");
  });
});
