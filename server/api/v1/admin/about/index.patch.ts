import { readBody } from 'h3';

import { aboutProfileUpdateSchema } from '../../../../../shared/schemas/about';
import { aboutApiError } from '../../../../services/about-service';
import { apiError } from '../../../../utils/api-response';
import { useAboutService } from '../../../../utils/about';

export default defineEventHandler(async (event) => {
  const parsed = aboutProfileUpdateSchema.safeParse(await readBody(event));
  if (!parsed.success) {
    return apiError(
      event,
      400,
      'VALIDATION_ERROR',
      'About fields are invalid',
      parsed.error.flatten(),
    );
  }

  try {
    return { data: await useAboutService().update(parsed.data) };
  } catch (error) {
    const mapped = aboutApiError(error);
    if (mapped) return apiError(event, mapped.statusCode, mapped.code, mapped.message);
    throw error;
  }
});
