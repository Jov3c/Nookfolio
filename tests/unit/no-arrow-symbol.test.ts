import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../..');
const sourceRoots = ['app', 'server', 'shared', 'prisma'];
const sourceExtensions = new Set(['.ts', '.vue', '.css', '.sql']);

function sourceFiles(path: string): string[] {
  return readdirSync(path).flatMap((name) => {
    const child = resolve(path, name);
    return statSync(child).isDirectory()
      ? sourceFiles(child)
      : sourceExtensions.has(extname(child))
        ? [child]
        : [];
  });
}

describe('site copy', () => {
  it('does not include the diagonal external-link arrow anywhere in production source', () => {
    const forbiddenSymbol = String.fromCodePoint(0x2197);
    for (const directory of sourceRoots) {
      for (const file of sourceFiles(resolve(root, directory))) {
        expect(readFileSync(file, 'utf8'), file).not.toContain(forbiddenSymbol);
      }
    }
  });
});
