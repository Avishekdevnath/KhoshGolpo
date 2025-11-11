import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';
import type { ActiveUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<ActiveUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists.');
    }

    const status =
      (user as typeof user & { status?: string }).status ?? 'active';
    if (status === 'banned') {
      throw new UnauthorizedException('Account has been banned.');
    }
    if (status === 'suspended') {
      throw new UnauthorizedException('Account is suspended.');
    }

    return {
      userId: user.id,
      email: user.email,
      handle: user.handle,
      roles: user.roles,
      displayName: user.displayName,
    };
  }
}
