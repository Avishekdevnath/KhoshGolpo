import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ListThreadsQueryDto } from './list-threads.query';

describe('ListThreadsQueryDto', () => {
  it('applies defaults when values are missing', () => {
    const dto = plainToInstance(ListThreadsQueryDto, {});

    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(20);
    expect(dto.status).toBeUndefined();
  });

  it('coerces numeric values from strings', () => {
    const dto = plainToInstance(ListThreadsQueryDto, {
      page: '3',
      limit: '15',
    });

    expect(dto.page).toBe(3);
    expect(dto.limit).toBe(15);
  });

  it('rejects invalid status values', async () => {
    const dto = plainToInstance(ListThreadsQueryDto, { status: 'invalid' });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('status');
  });
});
