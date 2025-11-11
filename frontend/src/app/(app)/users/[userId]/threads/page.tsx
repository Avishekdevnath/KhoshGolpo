import { notFound } from "next/navigation";

import { UserThreadsView } from "@/components/threads/user-threads-view";

interface UserThreadsPageProps {
  params: {
    userId?: string;
  };
}

export default function UserThreadsPage({ params }: UserThreadsPageProps) {
  const rawUserId = params.userId;
  if (!rawUserId) {
    notFound();
  }

  const userId = decodeURIComponent(rawUserId);

  return (
    <UserThreadsView
      userId={userId}
      title="Member conversations"
      description="Search and review the threads started by this member."
      emptyMessage="This member hasn’t started any threads yet."
    />
  );
}


