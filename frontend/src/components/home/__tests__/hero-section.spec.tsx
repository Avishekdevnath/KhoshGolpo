import { render, screen } from '@testing-library/react';
import { HeroSection } from '../hero-section';
import { HomePageProvider } from '@/components/home/home-context';

describe('HeroSection', () => {
  const renderComponent = () =>
    render(
      <HomePageProvider>
        <HeroSection />
      </HomePageProvider>,
    );

  it('shows primary marketing headline and CTAs', () => {
    renderComponent();

    expect(
      screen.getByText("Your community’s warmth, scaled with care—not chaos.", { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start a warm trial/i })).toHaveAttribute(
      'href',
      '/auth/register',
    );
    expect(screen.getByRole('link', { name: /peek inside/i })).toHaveAttribute(
      'href',
      '/auth/login',
    );
  });

  it('renders live metrics pulled from context', () => {
    renderComponent();

    expect(screen.getByText(/Warmth index/i)).toBeInTheDocument();
    expect(screen.getByText(/Turnaround/i)).toBeInTheDocument();
    expect(screen.getByText(/Stories amplified/i)).toBeInTheDocument();
  });
});

