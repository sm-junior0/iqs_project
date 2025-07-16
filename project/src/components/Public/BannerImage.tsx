import React from 'react';
import hero from '../../assets/images/hero.jpg'

const BannerImage = () => {
  return (
    <section id="about" className="py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          <img
            src={hero}
            alt="Young Muslim student in traditional dress"
            className="w-full h-[300px] md:h-[400px] lg:h-[500px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      </div>
    </section>
  );
};

export default BannerImage;