import { defineEventHandler } from 'h3';

import { authApiError } from '../utils/api-response';
import { assertSameOrigin, requireAdmin } from '../utils/auth';

export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/v1/admin/')) return;

  try {
    await requireAdmin(event);
    if (!['GET', 'HEAD', 'OPTIONS'].includes(event.method)) {
      assertSameOrigin(event, { required: true });
    }
  } catch (error) {
    return authApiError(event, error);
  }
});
