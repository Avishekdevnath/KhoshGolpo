import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SiteNavbar } from '../site-navbar';

describe('SiteNavbar', () => {
  it('renders brand and primary navigation links', () => {
    render(<SiteNavbar />);

    expect(screen.getByText(/KHOSH GOLPO/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /KHOSH GOLPO/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Features/i })).toHaveAttribute('href', '#features');
    expect(screen.getByRole('link', { name: /How It Works/i })).toHaveAttribute(
      'href',
      '#how-it-works',
    );
    expect(screen.getByRole('link', { name: /Community/i })).toHaveAttribute('href', '#community');
    expect(screen.getByRole('link', { name: /FAQ/i })).toHaveAttribute('href', '#faq');
  });

  it('provides authentication shortcuts', () => {
    render(<SiteNavbar />);

    expect(screen.getByRole('link', { name: /Sign in/i })).toHaveAttribute('href', '/auth/login');
    expect(screen.getByRole('link', { name: /Join circles/i })).toHaveAttribute(
      'href',
      '/auth/register',
    );
  });
});

