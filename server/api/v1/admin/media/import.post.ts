import { mediaImportSchema } from '../../../../../shared/schemas/media';
import { mediaApiError } from '../../../../services/media-service';
import { apiError } from '../../../../utils/api-response';
import { useMediaService } from '../../../../utils/media';
import { downloadRemoteImage } from '../../../../utils/remote-image';

export default defineEventHandler(async (event) => {
  const parsed = mediaImportSchema.safeParse(await readBody(event));
  if (!parsed.success) {
    return apiError(event, 400, 'VALIDATION_ERROR', 'Online image fields are invalid', parsed.error.flatten());
  }

  try {
    const remote = await downloadRemoteImage(parsed.data.url);
    const media = await useMediaService().upload({
      ...remote,
      category: parsed.data.category,
      altText: parsed.data.altText,
    });
    return { data: media };
  } catch (error) {
    const mediaError = mediaApiError(error);
    if (mediaError) return apiError(event, mediaError.statusCode, mediaError.code, mediaError.message);
    throw error;
  }
});
