export interface JwtPayload {
  sub: string;
  email: string;
  handle: string;
  roles: string[];
}

export interface RefreshTokenPayload extends Pick<JwtPayload, 'sub' | 'email'> {
  tokenId: string;
}
