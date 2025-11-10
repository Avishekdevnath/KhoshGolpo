const sanitizeUrl = (value: string | undefined, fallback: string) =>
  (value?.replace(/\/$/, '') || fallback).replace(/\/$/, '');

export const env = {
  apiUrl: sanitizeUrl(process.env.NEXT_PUBLIC_API_URL, 'https://khoshgolpo.onrender.com'),
  socketUrl: sanitizeUrl(process.env.NEXT_PUBLIC_SOCKET_URL, 'https://khoshgolpo.onrender.com'),
};

export const appConfig = {
  defaultRedirect: '/threads',
  loginPath: '/auth/login',
  registerPath: '/auth/register',
};

