import { aboutApiError } from '../../../services/about-service';
import { apiError } from '../../../utils/api-response';
import { useAboutService } from '../../../utils/about';

export default defineEventHandler(async (event) => {
  try {
    return { data: await useAboutService().getPublic() };
  } catch (error) {
    const mapped = aboutApiError(error);
    if (mapped) return apiError(event, mapped.statusCode, mapped.code, mapped.message);
    throw error;
  }
});
