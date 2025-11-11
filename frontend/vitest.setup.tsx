/* eslint-disable @next/next/no-img-element */
import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';
import * as nextRouterMock from 'next-router-mock';

vi.mock('next/link', () => ({
  default: ({ children, ...props }: { children: React.ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock('next/router', () => nextRouterMock);

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

