import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { CaptchaChallengeRepository } from '../../server/repositories/captcha-repository';
import { CommunityRepository } from '../../server/repositories/community-repository';
import { CaptchaService } from '../../server/services/captcha-service';
import { CommunityService } from '../../server/services/community-service';
import { createPrismaClient } from '../../server/utils/prisma';
import type { CaptchaPurpose } from '../../shared/schemas/captcha';

const databaseUrl = process.env.DATABASE_URL ?? '';
const prisma = createPrismaClient(databaseUrl);
const suffix = `${Date.now()}`;
const secret = 'integration-captcha-secret';
const answer = '7K3M';

describe('captcha-protected community lifecycle', () => {
  let postId = '';
  let categoryId = '';
  const postSlug = `community-${suffix}`;

  beforeAll(async () => {
    const category = await prisma.postCategory.create({
      data: { slug: `community-${suffix}`, name: 'Community', sortOrder: 999, visible: true },
    });
    categoryId = category.id;
    const post = await prisma.post.create({
      data: {
        slug: postSlug,
        title: 'Community integration post',
        excerpt: 'Community integration fixture.',
        categoryId,
        coverMediaId: null,
        markdownBody: '# Community',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        wordCount: 1,
        viewCount: BigInt(0),
        seoTitle: null,
        seoDescription: null,
      },
    });
    postId = post.id;
  });

  afterAll(async () => {
    if (postId) await prisma.articleComment.deleteMany({ where: { postId } });
    await prisma.message.deleteMany({ where: { nickname: { startsWith: `Test-${suffix}` } } });
    await prisma.captchaChallenge.deleteMany({
      where: { ipHash: { startsWith: `test-${suffix}` } },
    });
    if (postId) await prisma.post.delete({ where: { id: postId } }).catch(() => undefined);
    if (categoryId)
      await prisma.postCategory.delete({ where: { id: categoryId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  async function submitWithCaptcha<T>(
    purpose: CaptchaPurpose,
    ipHash: string,
    action: (service: CommunityService, captcha: { id: string; answer: string }) => Promise<T>,
  ) {
    const issuer = new CaptchaService(new CaptchaChallengeRepository(prisma), secret, () => answer);
    const challenge = await issuer.issue(purpose, ipHash);
    return prisma.$transaction(async (transaction) => {
      await new CaptchaService(
        new CaptchaChallengeRepository(transaction),
        secret,
        () => answer,
      ).consume({ id: challenge.id, answer }, purpose, ipHash);
      return action(new CommunityService(new CommunityRepository(transaction)), {
        id: challenge.id,
        answer,
      });
    });
  }

  it('publishes plain-text comments immediately and normalizes visitor replies', async () => {
    const rootIp = `test-${suffix}-comment-root`;
    const root = await submitWithCaptcha('COMMENT', rootIp, (service, captcha) =>
      service.submitComment(
        postSlug,
        {
          nickname: `Test-${suffix}-root`,
          content: '<script>plain text</script>',
          parentId: null,
          captchaChallengeId: captcha.id,
          captchaAnswer: captcha.answer,
          website: '',
        },
        rootIp,
      ),
    );
    const replyIp = `test-${suffix}-comment-reply`;
    await submitWithCaptcha('REPLY', replyIp, (service, captcha) =>
      service.submitComment(
        postSlug,
        {
          nickname: `Test-${suffix}-reply`,
          content: 'visitor reply',
          parentId: root.id,
          captchaChallengeId: captcha.id,
          captchaAnswer: captcha.answer,
          website: '',
        },
        replyIp,
      ),
    );

    const published = await new CommunityService(
      new CommunityRepository(prisma),
    ).listPublicComments(postSlug, { page: 1, pageSize: 20 });
    const comment = published.items.find((item) => item.id === root.id)!;
    expect(comment.content).toBe('<script>plain text</script>');
    expect(comment).not.toHaveProperty('email');
    expect(comment.replies[0]).toMatchObject({ replyToNickname: `Test-${suffix}-root` });
  });

  it('keeps private messages admin-only and rejects public replies to them', async () => {
    const ipHash = `test-${suffix}-private`;
    const created = await submitWithCaptcha('MESSAGE', ipHash, (service, captcha) =>
      service.submitMessage(
        {
          nickname: `Test-${suffix}-private`,
          content: 'private message',
          isPrivate: true,
          parentId: null,
          captchaChallengeId: captcha.id,
          captchaAnswer: captcha.answer,
          website: '',
        },
        ipHash,
      ),
    );
    const service = new CommunityService(new CommunityRepository(prisma));
    expect((await service.listPublicMessages({ page: 1, pageSize: 20 })).items).not.toContainEqual(
      expect.objectContaining({ id: created.id }),
    );
    await expect(
      service.submitMessage(
        {
          nickname: `Test-${suffix}-attacker`,
          content: 'guess reply',
          parentId: created.id,
          captchaChallengeId: '11111111-1111-4111-8111-111111111111',
          captchaAnswer: answer,
          website: '',
        },
        `test-${suffix}-attacker`,
      ),
    ).rejects.toMatchObject({ code: 'INVALID_MESSAGE_PARENT' });
  });

  it('serializes identical concurrent submissions', async () => {
    const ipHash = `test-${suffix}-duplicate`;
    const submit = () =>
      submitWithCaptcha('MESSAGE', ipHash, (service, captcha) =>
        service.submitMessage(
          {
            nickname: `Test-${suffix}-duplicate`,
            content: 'same content',
            parentId: null,
            captchaChallengeId: captcha.id,
            captchaAnswer: captcha.answer,
            website: '',
          },
          ipHash,
        ),
      );

    const results = await Promise.allSettled([submit(), submit()]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
  });
});
