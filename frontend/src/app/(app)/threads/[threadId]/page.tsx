'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FormMessage } from '@/components/ui/form-message';
import { useAuth } from '@/lib/auth/hooks';
import { getThread, createPost, type Thread, type Post } from '@/lib/api/threads';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createPostSchema = z.object({
  body: z.string().min(1, 'Post body is required').max(10000, 'Post must be at most 10000 characters'),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

function PostCard({ post }: { post: Post }) {
  const formattedDate = new Date(post.createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <Card className="p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            User {post.authorId.slice(0, 8)}
          </span>
          {post.parentPostId && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">(reply)</span>
          )}
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{formattedDate}</span>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{post.body}</p>
      </div>
      {post.moderationState !== 'approved' && (
        <div className="mt-3 rounded-md bg-yellow-50 p-2 text-xs text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          Moderation: {post.moderationState}
        </div>
      )}
    </Card>
  );
}

function ReplyComposer({
  threadId,
  onPostCreated,
}: {
  threadId: string;
  onPostCreated: () => void;
}) {
  const { accessToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
  });

  const onSubmit = async (data: CreatePostFormData) => {
    if (!accessToken) {
      toast.error('You must be logged in to post');
      return;
    }

    setIsSubmitting(true);

    try {
      await createPost(threadId, { body: data.body }, accessToken);
      toast.success('Post created successfully!');
      reset();
      onPostCreated();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create post';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Post a Reply
      </h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Textarea
            {...register('body')}
            placeholder="Write your reply..."
            rows={6}
            className="w-full"
          />
          {errors.body && <FormMessage message={errors.body.message} />}
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="submit" isLoading={isSubmitting}>
            Post Reply
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function ThreadDetailPage({ params }: { params: { threadId: string } }) {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, error, isLoading, mutate } = useSWR(
    accessToken ? ['thread', params.threadId, page, limit, accessToken] : null,
    () => getThread(params.threadId, page, limit, accessToken),
    {
      revalidateOnFocus: false,
    },
  );

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">
              Failed to load thread
            </p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
            <div className="mt-4 flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => mutate()}>
                Try again
              </Button>
              <Button variant="ghost" onClick={() => router.push('/threads')}>
                Back to Threads
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-100" />
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Loading thread...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { thread, posts, pagination } = data;
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const formattedDate = new Date(thread.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <Link href="/threads">
            <Button variant="ghost" className="mb-2">
              ← Back to Threads
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Thread Header */}
          <Card className="p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {thread.title}
              </h1>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${
                  thread.status === 'open'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : thread.status === 'locked'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {thread.status}
              </span>
            </div>

            {thread.tags && thread.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {thread.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
              <span>{thread.postsCount} posts</span>
              <span>•</span>
              <span>{thread.participantsCount} participants</span>
              <span>•</span>
              <span>Created {formattedDate}</span>
            </div>
          </Card>

          {/* Posts List */}
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Page {pagination.page} of {totalPages} • {pagination.total} total posts
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Reply Composer */}
          {thread.status === 'open' && (
            <ReplyComposer threadId={thread.id} onPostCreated={() => mutate()} />
          )}

          {thread.status !== 'open' && (
            <Card className="p-6">
              <p className="text-center text-zinc-600 dark:text-zinc-400">
                This thread is {thread.status} and no longer accepting new posts.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

