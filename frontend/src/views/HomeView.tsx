import React from 'react';
import { HeroSlider } from '../components/home/HeroSlider';
import { LineAccordion } from '../components/home/LineAccordion';
import { DigitalCatalogBanner } from '../components/home/DigitalCatalogBanner';
import { VideoSection } from '../components/home/VideoSection';

export const HomeView: React.FC = () => {
  return (
    <div className="space-y-0 animate-fadeIn">
      <HeroSlider />
      <LineAccordion />
      <DigitalCatalogBanner />
      <VideoSection />
    </div>
  );
};
