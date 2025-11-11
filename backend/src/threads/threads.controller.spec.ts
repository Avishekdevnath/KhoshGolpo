import { Test, TestingModule } from '@nestjs/testing';
import type { ActiveUser } from '../common/decorators/current-user.decorator';
import { ThreadsController } from './threads.controller';
import { ThreadsService } from './threads.service';

describe('ThreadsController', () => {
  let controller: ThreadsController;
  let threadsService: jest.Mocked<
    Pick<ThreadsService, 'deletePost' | 'deleteThread'>
  >;

  beforeEach(async () => {
    threadsService = {
      deletePost: jest
        .fn<Promise<void>, [ActiveUser, string, string]>()
        .mockResolvedValue(undefined),
      deleteThread: jest
        .fn<Promise<void>, [ActiveUser, string]>()
        .mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThreadsController],
      providers: [
        {
          provide: ThreadsService,
          useValue: threadsService,
        },
      ],
    }).compile();

    controller = module.get(ThreadsController);
  });

  it('delegates post deletion to the service', async () => {
    const user = { userId: 'user-1' } as ActiveUser;

    await expect(
      controller.deletePost('thread-1', 'post-1', user),
    ).resolves.toBeUndefined();

    expect(threadsService.deletePost).toHaveBeenCalledWith(
      user,
      'thread-1',
      'post-1',
    );
  });

  it('delegates thread deletion to the service', async () => {
    const user = { userId: 'user-1' } as ActiveUser;

    await expect(
      controller.deleteThread('thread-1', user),
    ).resolves.toBeUndefined();

    expect(threadsService.deleteThread).toHaveBeenCalledWith(user, 'thread-1');
  });
});
