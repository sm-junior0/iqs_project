import React from 'react';
import amara from '../../assets/logos/amara.png'
import kanba from '../../assets/logos/kanba.png'
import liva from '../../assets/logos/liva.png'

import { useLanguage } from '../../context/LanguageContext';

interface School {
  name: string;
  logo: string;
}
const CertifiedSchools: React.FC = () => {
  const { language, t } = useLanguage();

  const schools: School[] = [
    { name: 'liwa', logo: liva },
    { name: 'kanba', logo: kanba },
    { name: 'amara', logo: amara },
    { name: 'amara', logo: amara },
    { name: 'amara', logo: amara },
    { name: 'amara', logo: amara },
    { name: 'amara', logo: amara },
    { name: 'amara', logo: amara },
  ];

  
  return (
    <section id='schools' className={`py-16 bg-white ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('certifiedSchools.title')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('certifiedSchools.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center">
          {schools.map((school, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
            >
              <img
                src={school.logo}
                alt={school.name}
                className="max-h-12 max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 group-hover:opacity-100"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertifiedSchools;