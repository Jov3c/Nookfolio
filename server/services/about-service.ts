import { aboutProfileUpdateSchema, type AboutSiteFact } from '../../shared/schemas/about';
import type { AboutRepository } from '../repositories/about-repository';

export class AboutError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AboutError';
  }
}

type AboutAggregate = NonNullable<Awaited<ReturnType<AboutRepository['find']>>>;

export class AboutService {
  constructor(private readonly repository: AboutRepository) {}

  async getPublic() {
    return toDto(await this.requireProfile());
  }

  async getAdmin() {
    return toDto(await this.requireProfile());
  }

  async update(input: unknown) {
    const parsed = aboutProfileUpdateSchema.safeParse(input);
    if (!parsed.success) {
      throw new AboutError(400, 'INVALID_ABOUT', 'About fields are invalid');
    }
    const current = await this.requireProfile();
    return toDto(await this.repository.update(current.id, parsed.data));
  }

  private async requireProfile() {
    const profile = await this.repository.find();
    if (!profile) throw new AboutError(503, 'ABOUT_NOT_CONFIGURED', 'About is not configured');
    return profile;
  }
}

export function aboutApiError(error: unknown) {
  return error instanceof AboutError
    ? { statusCode: error.statusCode, code: error.code, message: error.message }
    : null;
}

function toDto(profile: AboutAggregate) {
  return {
    eyebrow: profile.eyebrow,
    title: profile.title,
    introduction: profile.introduction,
    personalTitle: profile.personalTitle,
    personalBody: profile.personalBody,
    quote: profile.quote,
    siteTitle: profile.siteTitle,
    siteBody: profile.siteBody,
    siteFacts: profile.siteFacts as AboutSiteFact[],
    updatedAt: profile.updatedAt.toISOString(),
  };
}
