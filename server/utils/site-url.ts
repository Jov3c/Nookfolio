import { normalizeSiteUrl } from '../../shared/site-url';

export { normalizeSiteUrl };

export function resolvePublicSiteUrl(configured: string | undefined, requestOrigin: string) {
  return normalizeSiteUrl(configured) ?? normalizeSiteUrl(requestOrigin) ?? 'http://localhost:3000';
}
