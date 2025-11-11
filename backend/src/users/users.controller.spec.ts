import { Test } from '@nestjs/testing';
import { ThreadStatus, UserStatus } from '@prisma/client/index';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ThreadsService } from '../threads/threads.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  let threadsService: ThreadsService;

  const mockUsersService = {
    searchUsers: jest.fn(),
    updateProfile: jest.fn(),
    findById: jest.fn(),
    listPublicUsers: jest.fn(),
    findPublicProfileByHandle: jest.fn(),
  } as unknown as UsersService;

  const mockThreadsService = {
    listRecentThreadsByAuthor: jest.fn(),
  } as unknown as ThreadsService;

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ThreadsService,
          useValue: mockThreadsService,
        },
      ],
    }).compile();

    controller = moduleRef.get(UsersController);
    usersService = moduleRef.get(UsersService);
    threadsService = moduleRef.get(ThreadsService);
  });

  describe('listPublicUsers', () => {
    it('returns public summary DTOs with pagination metadata', async () => {
      const listPublicUsersSpy = jest.spyOn(usersService, 'listPublicUsers');
      listPublicUsersSpy.mockResolvedValue({
        data: [
          {
            id: '1',
            handle: 'jane',
            displayName: 'Jane Doe',
            avatarUrl: 'https://cdn.example.com/jane.png',
            threadsCount: 2,
            postsCount: 5,
            createdAt: new Date('2025-01-01T00:00:00.000Z'),
            lastActiveAt: new Date('2025-01-02T00:00:00.000Z'),
            roles: ['member'],
            status: UserStatus.active,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      });

      const result = await controller.listPublicUsers({
        query: 'jan',
        page: 1,
        limit: 20,
      });

      expect(listPublicUsersSpy).toHaveBeenCalledWith({
        query: 'jan',
        page: 1,
        limit: 20,
        role: undefined,
        status: 'active',
      });
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toMatchObject({
        id: '1',
        handle: 'jane',
        displayName: 'Jane Doe',
        avatarUrl: 'https://cdn.example.com/jane.png',
        threadsCount: 2,
        postsCount: 5,
      });
      expect(result.data[0]).not.toHaveProperty('email');
    });
  });

  describe('searchUsers', () => {
    it('returns user suggestion DTOs from service results', async () => {
      const searchUsersSpy = jest.spyOn(usersService, 'searchUsers');
      searchUsersSpy.mockResolvedValue([
        {
          id: '1',
          handle: 'jane',
          displayName: 'Jane Doe',
          avatarUrl: 'https://cdn.example.com/jane.png',
          roles: ['member'],
          status: UserStatus.active,
          threadsCount: 0,
          postsCount: 0,
          createdAt: new Date('2025-01-01T00:00:00.000Z'),
          lastActiveAt: new Date('2025-01-02T00:00:00.000Z'),
        },
      ]);

      const result = await controller.searchUsers({
        query: 'ja',
        limit: undefined,
      });

      expect(searchUsersSpy).toHaveBeenCalledWith('ja', undefined, {
        status: undefined,
        role: undefined,
      });
      expect(result).toEqual([
        {
          id: '1',
          handle: 'jane',
          displayName: 'Jane Doe',
          avatarUrl: 'https://cdn.example.com/jane.png',
          status: UserStatus.active,
          roles: ['member'],
        },
      ]);
    });
  });

  describe('getPublicProfile', () => {
    it('throws NotFoundException when user is banned', async () => {
      jest.spyOn(usersService, 'findPublicProfileByHandle').mockResolvedValue({
        id: '1',
        handle: 'jane',
        displayName: 'Jane Doe',
        avatarUrl: null,
        roles: ['member'],
        status: UserStatus.banned,
        threadsCount: 0,
        postsCount: 0,
        createdAt: new Date(),
        lastActiveAt: null,
      });

      await expect(
        controller.getPublicProfile('jane', { threadsLimit: 3 }),
      ).rejects.toThrow('User not found.');
    });

    it('returns public profile and list of threads', async () => {
      const profile = {
        id: '1',
        handle: 'jane',
        displayName: 'Jane Doe',
        avatarUrl: 'https://cdn.example.com/jane.png',
        roles: ['member'],
        status: UserStatus.active,
        threadsCount: 2,
        postsCount: 5,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        lastActiveAt: new Date('2025-01-02T00:00:00.000Z'),
      };
      const findProfileSpy = jest.spyOn(
        usersService,
        'findPublicProfileByHandle',
      );
      findProfileSpy.mockResolvedValue(profile);

      const listThreadsSpy = jest.spyOn(
        threadsService,
        'listRecentThreadsByAuthor',
      );
      listThreadsSpy.mockResolvedValue([
        {
          id: 't1',
          title: 'First thread',
          slug: 'first-thread',
          status: ThreadStatus.open,
          lastActivityAt: new Date('2025-01-03T00:00:00.000Z'),
          postsCount: 3,
          createdAt: new Date('2025-01-01T00:00:00.000Z'),
        } as any,
      ]);

      const result = await controller.getPublicProfile('jane', {
        threadsLimit: 3,
      });

      expect(findProfileSpy).toHaveBeenCalledWith('jane');
      expect(listThreadsSpy).toHaveBeenCalledWith('1', 3);
      expect(result.user).toMatchObject({
        id: '1',
        handle: 'jane',
        displayName: 'Jane Doe',
        avatarUrl: 'https://cdn.example.com/jane.png',
        threadsCount: 2,
        postsCount: 5,
      });
      expect(result.user).not.toHaveProperty('email');
      expect(result.threads).toHaveLength(1);
      expect(result.threads[0]).toMatchObject({
        id: 't1',
        title: 'First thread',
        slug: 'first-thread',
        status: ThreadStatus.open,
        postsCount: 3,
      });
    });
  });
});
