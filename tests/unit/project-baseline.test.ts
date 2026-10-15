import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { PROJECT_NAME } from '../../shared/constants/project';

describe('project baseline', () => {
  it('exposes the public project identity', () => {
    expect(PROJECT_NAME).toBe('Nookfolio');
    expect(JSON.parse(readFileSync(resolve('package.json'), 'utf8')).name).toBe('nookfolio');
  });

  it('runs tests on the supported Node major version', () => {
    expect(process.version.startsWith('v24.')).toBe(true);
  });
});
