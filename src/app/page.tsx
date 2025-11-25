// src/app/page.tsx
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
    return (
        <div className="bg-gray-50 text-gray-800">
            <Navbar />
            <main>
                <HeroSection />
                <FeaturesSection />
                <TestimonialsSection />
                <FinalCTA />
            </main>
            <Footer />
        </div>
    );
}
