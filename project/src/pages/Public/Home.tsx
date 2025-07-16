import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import HeroSection from '../../components/Public/HeroSection';
import BannerImage from '../../components/Public/BannerImage';
import StatsSection from '../../components/Public/StatsSection';
import QuickActions from '../../components/Public/QuickActions';
import NewsStories from '../../components/Public/NewsStories';
import StandardsOverview from '../../components/Public/StandardsOverview';
import CertifiedSchools from '../../components/Public/CertifiedSchools';
import ContactSection from '../../components/Public/ContactSection';

const Home = () => {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <BannerImage />
        <StatsSection />
        <QuickActions />
        <NewsStories />
        <StandardsOverview />
        <CertifiedSchools />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
};

export default Home;