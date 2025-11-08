'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/hooks';
import { listThreads, type Thread } from '@/lib/api/threads';
import { toast } from 'sonner';
import { CreateThreadModal } from '@/components/threads/create-thread-modal';
import Link from 'next/link';

function ThreadsHeader() {
  const { user, logout, isActionPending } = useAuth();

  return (
    <header className="flex flex-col gap-4 border-b border-zinc-200 bg-white px-6 py-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Signed in as
        </p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {user?.displayName}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">@{user?.handle}</p>
      </div>
      <Button variant="ghost" onClick={() => logout()} isLoading={isActionPending}>
        Sign out
      </Button>
    </header>
  );
}

function ThreadCard({ thread }: { thread: Thread }) {
  const formattedDate = new Date(thread.lastActivityAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link href={`/threads/${thread.id}`}>
      <Card className="cursor-pointer transition-shadow hover:shadow-md">
        <div className="p-6">
          <div className="mb-2 flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {thread.title}
            </h3>
            <span
              className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
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
            <div className="mb-3 flex flex-wrap gap-2">
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
            <span>{formattedDate}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ThreadsList() {
  const { accessToken } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, error, isLoading, mutate } = useSWR(
    accessToken ? ['threads', page, limit, accessToken] : null,
    () => listThreads({ page, limit }, accessToken),
    {
      revalidateOnFocus: false,
    },
  );

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">
            Failed to load threads
          </p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => mutate()}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-100" />
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Loading threads...</p>
        </div>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            No threads yet
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Be the first to start a conversation!
          </p>
        </div>
      </div>
    );
  }

  const { data: threads, pagination } = data;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-4 p-6">
        {threads.map((thread) => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="border-t border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Page {pagination.page} of {totalPages} • {pagination.total} total threads
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
        </div>
      )}
    </div>
  );
}

export default function ThreadsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <ThreadsHeader />
      <div className="flex-1">
        <div className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Threads</h2>
            <Button onClick={() => setIsCreateModalOpen(true)}>New Thread</Button>
          </div>
        </div>
        <ThreadsList />
      </div>
      <CreateThreadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
