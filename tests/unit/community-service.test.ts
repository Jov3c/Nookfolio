import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { CommunityError, CommunityService } from '../../server/services/community-service';
import type { CommentCreateInput, MessageCreateInput } from '../../shared/schemas/community';

const captcha = {
  captchaChallengeId: '11111111-1111-4111-8111-111111111111',
  captchaAnswer: '7K3M',
  website: '',
};

function commentInput(overrides: Partial<CommentCreateInput> = {}): CommentCreateInput {
  return {
    nickname: '访客',
    email: undefined,
    content: 'hello <script>alert(1)</script>',
    parentId: null,
    ...captcha,
    ...overrides,
  };
}

function messageInput(overrides: Partial<MessageCreateInput> = {}): MessageCreateInput {
  return {
    nickname: '访客',
    email: undefined,
    content: '一条留言',
    parentId: null,
    isPrivate: false,
    ...captcha,
    ...overrides,
  };
}

class MemoryCommunityRepository {
  comments: any[] = [];
  messages: any[] = [];
  post = { id: '22222222-2222-4222-8222-222222222222', slug: 'hello' };

  async findPublishedPostBySlug(slug: string) {
    return slug === this.post.slug ? this.post : null;
  }

  async findCommentById(id: string) {
    return this.comments.find((entry) => entry.id === id) ?? null;
  }

  async findMessageById(id: string) {
    return this.messages.find((entry) => entry.id === id) ?? null;
  }

  async findRecentDuplicateComment(postId: string, ipHash: string, content: string) {
    return this.comments.find(
      (entry) => entry.postId === postId && entry.ipHash === ipHash && entry.content === content,
    );
  }

  async findRecentDuplicateMessage(ipHash: string, content: string) {
    return this.messages.find((entry) => entry.ipHash === ipHash && entry.content === content);
  }

  async createComment(input: any) {
    const now = new Date('2026-10-19T09:00:00.000Z');
    const record = {
      id: randomUUID(),
      ...input,
      authorType: 'VISITOR',
      status: 'PUBLISHED',
      verifiedAt: now,
      createdAt: now,
      updatedAt: now,
      replies: [],
    };
    this.comments.push(record);
    return record;
  }

  async createMessage(input: any) {
    const now = new Date('2026-10-19T09:00:00.000Z');
    const record = {
      id: randomUUID(),
      ...input,
      authorType: 'VISITOR',
      status: 'PUBLISHED',
      verifiedAt: now,
      createdAt: now,
      updatedAt: now,
      replies: [],
    };
    this.messages.push(record);
    return record;
  }

  async listPublicComments(postId: string) {
    const items = this.comments.filter(
      (entry) => entry.postId === postId && entry.parentId === null && entry.status === 'PUBLISHED',
    );
    return { items, total: items.length, publishedTotal: this.comments.length };
  }

  async listPublicMessages() {
    const items = this.messages.filter(
      (entry) => entry.parentId === null && entry.status === 'PUBLISHED' && !entry.isPrivate,
    );
    return { items, total: items.length };
  }
}

function serviceFixture() {
  const repository = new MemoryCommunityRepository();
  return {
    repository,
    service: new CommunityService(repository as never),
  };
}

describe('community service instant publication', () => {
  it('publishes a plain-text comment immediately without requiring email', async () => {
    const { service } = serviceFixture();

    const submitted = await service.submitComment('hello', commentInput(), 'ip-a');
    const listed = await service.listPublicComments('hello', { page: 1, pageSize: 20 });

    expect(submitted).toMatchObject({ published: true, private: false });
    expect(listed.items).toHaveLength(1);
    expect(listed.items[0]!.content).toBe('hello <script>alert(1)</script>');
  });

  it('keeps a private message out of every public response', async () => {
    const { service } = serviceFixture();

    const submitted = await service.submitMessage(messageInput({ isPrivate: true }), 'ip-a');
    const listed = await service.listPublicMessages({ page: 1, pageSize: 20 });

    expect(submitted).toMatchObject({ published: false, private: true });
    expect(listed.items).toEqual([]);
  });

  it('normalizes a reply-to-reply under the root while retaining the addressed nickname', async () => {
    const { repository, service } = serviceFixture();
    const root = await repository.createComment({
      postId: repository.post.id,
      parentId: null,
      replyToNickname: null,
      nickname: '甲',
      email: null,
      content: 'root',
      ipHash: 'ip-root',
    });
    const child = await repository.createComment({
      postId: repository.post.id,
      parentId: root.id,
      replyToNickname: '甲',
      nickname: '乙',
      email: null,
      content: 'child',
      ipHash: 'ip-child',
    });

    await service.submitComment(
      'hello',
      commentInput({ parentId: child.id, content: 'reply child' }),
      'ip-a',
    );

    const created = repository.comments.at(-1)!;
    expect(created.parentId).toBe(root.id);
    expect(created.replyToNickname).toBe('乙');
  });

  it('blocks a duplicate normalized payload from the same anonymous IP', async () => {
    const { service } = serviceFixture();
    await service.submitMessage(messageInput({ content: ' same text ' }), 'ip-a');

    await expect(
      service.submitMessage(messageInput({ content: 'same text' }), 'ip-a'),
    ).rejects.toMatchObject<Partial<CommunityError>>({ code: 'DUPLICATE_CONTENT' });
  });
});
