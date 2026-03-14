import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductSection from '../components/ProductSection';
import { ApproachSection, AboutSection, CTASection } from '../components/Sections';
import FeaturedSection from '../components/FeaturedSection';
import DealSection from '../components/DealSection';
import { WhyChooseUs, CategorySection } from '../components/WhyCategorySection';
import { SubscribeSection, Footer } from '../components/SubscribeFooter';
import ChatWidget from '../components/ChatWidget';

export default function HomePage() {
  return (
    <div className="page-wrapper">
      <Header />
      <Hero />
      <ProductSection />
      <ApproachSection />
      <AboutSection />
      <FeaturedSection />
      <DealSection />
      <CTASection />
      <WhyChooseUs />
      <CategorySection />
      <SubscribeSection />
      <Footer />
      <ChatWidget />
    </div>
  );
}
