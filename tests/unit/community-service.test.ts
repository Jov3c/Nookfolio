import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import type { CommunityError } from '../../server/services/community-service';
import { CommunityService } from '../../server/services/community-service';
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

interface MemoryCommunityRecord {
  id: string;
  postId?: string;
  parentId: string | null;
  replyToNickname: string | null;
  nickname: string;
  email: string | null;
  content: string;
  ipHash: string;
  isPrivate?: boolean;
  authorType: 'VISITOR';
  status: 'PUBLISHED' | 'HIDDEN';
  verifiedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  replies: MemoryCommunityRecord[];
}

type MemoryCommentInput = Omit<
  MemoryCommunityRecord,
  'id' | 'authorType' | 'status' | 'verifiedAt' | 'createdAt' | 'updatedAt' | 'replies'
>;
type MemoryMessageInput = Omit<MemoryCommentInput, 'postId'>;

class MemoryCommunityRepository {
  comments: MemoryCommunityRecord[] = [];
  messages: MemoryCommunityRecord[] = [];
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

  async acquireSubmissionLock() {}

  async createComment(input: MemoryCommentInput) {
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

  async createMessage(input: MemoryMessageInput) {
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

  async listPublicComments(postId: string, query: { page: number; pageSize: number }) {
    const roots = this.comments
      .filter(
        (entry) =>
          entry.postId === postId && entry.parentId === null && entry.status === 'PUBLISHED',
      )
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
    const items = roots
      .slice((query.page - 1) * query.pageSize, query.page * query.pageSize)
      .map((root) => ({
        ...root,
        replies: this.comments
          .filter((entry) => entry.parentId === root.id && entry.status === 'PUBLISHED')
          .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime()),
      }));
    return {
      items,
      total: roots.length,
      publishedTotal: this.comments.filter((entry) => entry.status === 'PUBLISHED').length,
    };
  }

  async listPublicMessages(query: { page: number; pageSize: number }) {
    const roots = this.messages
      .filter(
        (entry) => entry.parentId === null && entry.status === 'PUBLISHED' && !entry.isPrivate,
      )
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
    return {
      items: roots.slice((query.page - 1) * query.pageSize, query.page * query.pageSize),
      total: roots.length,
    };
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

  it('paginates only public comment roots and keeps reply metadata', async () => {
    const { repository, service } = serviceFixture();
    for (let index = 0; index < 22; index += 1) {
      await repository.createComment({
        postId: repository.post.id,
        parentId: null,
        replyToNickname: null,
        nickname: `访客${index}`,
        email: null,
        content: `内容${index}`,
        ipHash: `ip-${index}`,
      });
    }
    repository.comments[0]!.status = 'HIDDEN';

    const secondPage = await service.listPublicComments('hello', { page: 2, pageSize: 20 });

    expect(secondPage.items).toHaveLength(1);
    expect(secondPage.total).toBe(21);
    expect(secondPage.items[0]).toHaveProperty('replyToNickname', null);
  });

  it('never counts private messages in public pagination', async () => {
    const { service } = serviceFixture();
    await service.submitMessage(messageInput({ content: '公开', isPrivate: false }), 'ip-public');
    await service.submitMessage(messageInput({ content: '私密', isPrivate: true }), 'ip-private');

    const page = await service.listPublicMessages({ page: 1, pageSize: 20 });

    expect(page.total).toBe(1);
    expect(page.items.map((item) => item.content)).toEqual(['公开']);
  });

  it('rejects public replies to private messages', async () => {
    const { repository, service } = serviceFixture();
    const privateMessage = await repository.createMessage({
      parentId: null,
      replyToNickname: null,
      nickname: '私密访客',
      email: null,
      content: '私密内容',
      isPrivate: true,
      ipHash: 'ip-private-root',
    });

    await expect(
      service.submitMessage(
        messageInput({ parentId: privateMessage.id, content: '猜测回复' }),
        'ip-a',
      ),
    ).rejects.toMatchObject<Partial<CommunityError>>({ code: 'INVALID_MESSAGE_PARENT' });
  });
});
