import { UsersService } from './users.service';
import type { PrismaService } from '../prisma/prisma.service';

type PrismaServiceMock = {
  user: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    create: jest.Mock;
  };
  refreshToken: {
    create: jest.Mock;
    deleteMany: jest.Mock;
  };
  $transaction: jest.Mock;
};

const createPrismaMock = (): PrismaServiceMock => ({
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let prismaMock: PrismaServiceMock;

  beforeEach(() => {
    prismaMock = createPrismaMock();
    service = new UsersService(prismaMock as unknown as PrismaService);
  });

  describe('searchUsers', () => {
    it('returns empty array when query is blank after trimming', async () => {
      const results = await service.searchUsers('   ');

      expect(results).toEqual([]);
      expect(prismaMock.user.findMany).not.toHaveBeenCalled();
    });

    it('caps the limit and searches by handle/display name', async () => {
      const findManyMock = prismaMock.user.findMany;
      findManyMock.mockResolvedValue([
        {
          id: '1',
          handle: 'jane',
          displayName: 'Jane Doe',
          avatarUrl: 'https://cdn.example.com/jane.png',
        },
      ]);

      const results = await service.searchUsers('ja', 100);

      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining<Record<string, unknown>>({
          where: expect.objectContaining<Record<string, unknown>>({
            OR: expect.arrayContaining([
              expect.objectContaining<Record<string, unknown>>({
                handle: { startsWith: 'ja' },
              }),
              expect.objectContaining<Record<string, unknown>>({
                displayName: expect.objectContaining<Record<string, string>>({
                  startsWith: 'ja',
                  mode: 'insensitive',
                }),
              }),
            ]),
          }),
          take: 20,
        }),
      );
      expect(results).toEqual([
        {
          id: '1',
          handle: 'jane',
          displayName: 'Jane Doe',
          avatarUrl: 'https://cdn.example.com/jane.png',
        },
      ]);
    });
  });
});
