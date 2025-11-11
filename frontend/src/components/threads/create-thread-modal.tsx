'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormMessage } from '@/components/ui/form-message';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getErrorMessage } from '@/lib/utils/error';
import { useCreateThread } from '@/lib/api/hooks/threads';

const createThreadSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150, 'Title must be at most 150 characters'),
  body: z.string().min(1, 'Body is required').max(10000, 'Body must be at most 10000 characters'),
  tags: z.string().optional(),
});

type CreateThreadFormData = z.infer<typeof createThreadSchema>;

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateThreadModal({ isOpen, onClose }: CreateThreadModalProps) {
  const createThread = useCreateThread();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateThreadFormData>({
    resolver: zodResolver(createThreadSchema),
  });

  if (!isOpen) return null;

  const onSubmit = async (data: CreateThreadFormData) => {
    setIsSubmitting(true);

    try {
      const tags = data.tags
        ? data.tags
            .split(',')
            .map((tag) => tag.trim().toLowerCase())
            .filter(Boolean)
        : undefined;

      const result = await createThread({
        title: data.title,
        body: data.body,
        tags,
      });

      toast.success('Thread created successfully!');
      reset();
      onClose();
      router.push(`/threads/${result.thread.id}`);
      router.refresh();
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to create thread');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl cursor-default rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Create New Thread
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter thread title..."
                className="mt-1"
              />
              {errors.title && <FormMessage message={errors.title.message} />}
            </div>

            <div>
              <Label htmlFor="body">Content</Label>
              <Textarea
                id="body"
                {...register('body')}
                placeholder="Write your post content..."
                rows={8}
                className="mt-1"
              />
              {errors.body && <FormMessage message={errors.body.message} />}
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                {...register('tags')}
                placeholder="e.g., discussion, question, help"
                className="mt-1"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Optional: Add tags to help others find your thread
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Thread
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

