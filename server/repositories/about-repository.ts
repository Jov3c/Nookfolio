import type { Prisma, PrismaClient } from '../generated/prisma/client';
import type { AboutProfileUpdateInput } from '../../shared/schemas/about';

export class AboutRepository {
  constructor(private readonly prisma: PrismaClient) {}

  find() {
    return this.prisma.aboutProfile.findUnique({ where: { singletonKey: 1 } });
  }

  update(id: string, input: AboutProfileUpdateInput) {
    return this.prisma.aboutProfile.update({
      where: { id },
      data: {
        ...input,
        ...(input.siteFacts === undefined
          ? {}
          : { siteFacts: input.siteFacts as Prisma.InputJsonValue }),
      },
    });
  }
}
