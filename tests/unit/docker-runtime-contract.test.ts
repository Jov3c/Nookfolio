import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('Docker runtime contract', () => {
  it('ships shared server dependencies used by content seeding', async () => {
    const dockerfile = await readFile(resolve(process.cwd(), 'Dockerfile'), 'utf8');

    expect(dockerfile).toMatch(
      /COPY\s+(?:--chown=[^\s]+\s+)?--from=build\s+\/app\/shared\s+\.\/shared/,
    );
  });

  it('rejects unknown hosts and redirects to the canonical production host', async () => {
    const nginx = await readFile(
      resolve(process.cwd(), 'docker/nginx/default.conf.template'),
      'utf8',
    );

    expect(nginx).toContain('server_name ${NOOKFOLIO_SERVER_NAME};');
    expect(nginx).toContain(
      'return 301 https://${NOOKFOLIO_SERVER_NAME}:${NOOKFOLIO_HTTPS_PORT}$request_uri;',
    );
    expect(nginx).toMatch(/default_server;[\s\S]*return 444;/);
    expect(nginx).not.toContain('https://$host');
    expect(nginx).toContain('proxy_set_header X-Forwarded-For $remote_addr;');
  });
});
