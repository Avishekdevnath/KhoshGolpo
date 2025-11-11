import '@prisma/client/index';

declare module '@prisma/client' {
  interface Post {
    upvotesCount?: number | null;
    downvotesCount?: number | null;
    repliesCount?: number | null;
  }
}
