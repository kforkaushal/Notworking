import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { TestimonialsSection } from './TestimonialsSection';
import { FinalCTA } from './FinalCTA';
import { Footer } from './Footer';

export default function LandingPage() {
  return (
    <main className="bg-gray-50">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}