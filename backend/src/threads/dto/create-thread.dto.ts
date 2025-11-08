import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateThreadDto {
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  body!: string;

  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value
          .map((tag: unknown) =>
            typeof tag === 'string' ? tag.trim().toLowerCase() : undefined,
          )
          .filter(Boolean)
      : [],
  )
  tags?: string[];
}
