import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService, REFRESH_TOKEN_COOKIE } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ProfileDto } from './dto/profile.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  type ActiveUser,
} from '../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Register a new user account.',
    description:
      'Creates a new user and sends a one-time passcode (OTP) to confirm ownership of the email address.',
  })
  @ApiCreatedResponse({
    description:
      'User registered successfully. Verification OTP has been dispatched.',
    type: RegisterResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed for the provided registration data.',
  })
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    const result = await this.authService.register(dto);

    return {
      emailVerificationRequired: result.emailVerificationRequired,
      verificationTokenId: result.verificationTokenId,
      verificationExpiresAt: result.verificationExpiresAt.toISOString(),
      message:
        'Account created successfully. Enter the verification code sent to your email to activate your account.',
    };
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate using email/handle and password.',
    description:
      'Validates credentials, issues JWT tokens, and sets the refresh token cookie.',
  })
  @ApiOkResponse({
    description: 'Authentication successful.',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.login(dto);
    this.authService.attachRefreshTokenCookie(
      res,
      result.tokens.refreshToken,
      result.tokens.refreshTokenExpiresAt,
    );

    return {
      accessToken: result.tokens.accessToken,
      user: ProfileDto.fromUser(result.user),
    };
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh the access token using a valid refresh token cookie.',
  })
  @ApiCookieAuth('refresh_token')
  @ApiOkResponse({
    description: 'New access and refresh tokens issued successfully.',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token is missing or invalid.',
  })
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const refreshToken = this.extractRefreshToken(req);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token cookie missing.');
    }

    const result = await this.authService.refresh(refreshToken);
    this.authService.attachRefreshTokenCookie(
      res,
      result.tokens.refreshToken,
      result.tokens.refreshTokenExpiresAt,
    );

    return {
      accessToken: result.tokens.accessToken,
      user: ProfileDto.fromUser(result.user),
    };
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Invalidate the refresh token and clear the auth session cookies.',
  })
  @ApiCookieAuth('refresh_token')
  @ApiOkResponse({
    description: 'Session successfully terminated.',
    type: LogoutResponseDto,
  })
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponseDto> {
    const refreshToken = this.extractRefreshToken(req);
    if (refreshToken) {
      const payload =
        await this.authService.tryDecodeRefreshToken(refreshToken);
      if (payload) {
        await this.authService.logout(payload.sub, payload.tokenId);
      }
    }

    this.authService.clearRefreshTokenCookie(res);

    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Retrieve the authenticated user profile.' })
  @ApiOkResponse({ description: 'Current user profile.', type: ProfileDto })
  @ApiUnauthorizedResponse({
    description: 'Access token missing, expired, or invalid.',
  })
  @Get('me')
  async me(@CurrentUser() user: ActiveUser): Promise<ProfileDto> {
    return this.authService.getProfile(user.userId);
  }

  @ApiOperation({
    summary: 'Confirm email verification using the OTP sent via email.',
  })
  @ApiOkResponse({
    description: 'Email verified successfully. Returns authentication tokens.',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Verification payload is missing or malformed.',
  })
  @ApiUnauthorizedResponse({
    description: 'Verification OTP is invalid, expired, or already used.',
  })
  @Post('verify-email')
  async verifyEmail(
    @Body() body: VerifyEmailDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.verifyEmail(body.tokenId, body.otp);

    this.authService.attachRefreshTokenCookie(
      res,
      result.tokens.refreshToken,
      result.tokens.refreshTokenExpiresAt,
    );

    return {
      accessToken: result.tokens.accessToken,
      user: ProfileDto.fromUser(result.user),
    };
  }

  private extractRefreshToken(req: Request): string | undefined {
    const cookies = (req.cookies as Record<string, unknown> | undefined) ?? {};
    const token = cookies[REFRESH_TOKEN_COOKIE];
    return typeof token === 'string' && token.length > 0 ? token : undefined;
  }
}
