import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Test } from '@nestjs/testing';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    searchUsers: jest.fn(),
    updateProfile: jest.fn(),
    findById: jest.fn(),
  } as unknown as UsersService;

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = moduleRef.get(UsersController);
    usersService = moduleRef.get(UsersService);
  });

  describe('searchUsers', () => {
    it('returns user suggestion DTOs from service results', async () => {
      const searchUsersSpy = jest
        .spyOn(usersService, 'searchUsers')
        .mockResolvedValue([
          {
            id: '1',
            handle: 'jane',
            displayName: 'Jane Doe',
            avatarUrl: 'https://cdn.example.com/jane.png',
          },
        ]);

      const result = await controller.searchUsers({
        query: 'ja',
        limit: undefined,
      });

      expect(searchUsersSpy).toHaveBeenCalledWith('ja', undefined);
      expect(result).toEqual([
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
