import { PostSchema } from './post.schema';

describe('PostSchema.fromModel', () => {
  const basePost = {
    id: 'post-1',
    threadId: 'thread-1',
    authorId: 'user-1',
    body: 'Hello world',
    moderationState: 'approved',
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
  };

  it('includes author metadata when provided', () => {
    const schema = PostSchema.fromModel({
      ...basePost,
      author: {
        id: 'user-1',
        handle: 'jdoe',
        displayName: 'John Doe',
        avatarUrl: 'https://example.com/avatar.png',
      },
    });

    expect(schema.author).toEqual({
      id: 'user-1',
      handle: 'jdoe',
      displayName: 'John Doe',
      avatarUrl: 'https://example.com/avatar.png',
    });
  });

  it('falls back to authorId when author metadata missing', () => {
    const schema = PostSchema.fromModel(basePost);

    expect(schema.author).toEqual({
      id: 'user-1',
      handle: null,
      displayName: null,
      avatarUrl: null,
    });
  });
});
