export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4000',
};

export const appConfig = {
  defaultRedirect: '/threads',
  loginPath: '/auth/login',
  registerPath: '/auth/register',
};

