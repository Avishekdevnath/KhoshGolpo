import type { User } from '@prisma/client/index';
import { UserSchema } from '../../users/schemas/user.schema';

export class ProfileDto extends UserSchema {
  static fromUser(user: User): ProfileDto {
    return Object.assign(new ProfileDto(), UserSchema.fromModel(user));
  }
}
