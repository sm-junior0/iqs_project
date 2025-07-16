import React, { useState } from 'react';
import { Play, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const HeroSection: React.FC = () => {
  const { language, t } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  return (
    <section
      id="home"
      className={`bg-gradient-to-br from-gray-50 to-blue-50 py-16 lg:py-24 ${
        language === 'ar' ? 'rtl' : 'ltr'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            {t('hero.title')}{' '}
            <span className="text-[#1B365D]">{t('hero.titleHighlight')}</span>
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed max-w-4xl mx-auto">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a
              href="/auth/register"
              className="bg-[#002855] hover:bg-[#001a3d] text-white font-medium rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              style={{
                width: '200px',
                height: '50px',
                paddingTop: '10px',
                paddingRight: '30px',
                paddingBottom: '10px',
                paddingLeft: '30px',
                fontSize: '16px',
              }}
            >
              {t('hero.getStarted')}
            </a>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="border-2 border-[#002855] text-[#002855] hover:bg-[#002855] hover:text-white font-medium rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              style={{
                width: '200px',
                height: '50px',
                paddingTop: '10px',
                paddingRight: '30px',
                paddingBottom: '10px',
                paddingLeft: '30px',
                fontSize: '16px',
              }}
            >
              <Play size={18} />
              <span>{t('hero.watchVideo')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal for video */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-900"
              onClick={() => setShowModal(false)}
              title="Close video modal"
            >
              <X size={24} />
            </button>
            <div className="aspect-w-16 aspect-h-9 w-full">
              <iframe
                width="100%"
                height="400"
                src="https://www.youtube.com/embed/PaPBXF22n4s"
                title="Muslim Inspiration Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
