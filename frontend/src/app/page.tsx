import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { HomePageProvider } from "@/components/home/home-context";
import { HeroSection } from "@/components/home/hero-section";
import { CommunitySection } from "@/components/home/community-section";
import { FaqSection } from "@/components/home/faq-section";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-950/95 to-indigo-950 text-slate-100">
      <SiteNavbar />
      <HomePageProvider>
        <main className="flex-1">
          <HeroSection />
          <CommunitySection />
          <FaqSection />
        </main>
      </HomePageProvider>
      <SiteFooter />
    </div>
  );
}
