import { createParamDecorator } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface ActiveUser {
  userId: string;
  email: string;
  handle: string;
  roles: string[];
  displayName: string;
}

export const CurrentUser = createParamDecorator<
  unknown,
  ActiveUser | undefined
>((_data, context: ExecutionContext) => {
  const request = context
    .switchToHttp()
    .getRequest<Request & { user?: ActiveUser }>();
  return request.user;
});
