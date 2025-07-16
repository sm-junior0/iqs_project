import React from 'react';
import { FileText, School, MessageCircle } from 'lucide-react';
import Button from '../ui/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

interface Action {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}

const QuickActions: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const actions: Action[] = [
    {
      icon: <FileText size={48} />,
      title: t('quickActions.apply.title'),
      description: t('quickActions.apply.description'),
      buttonText: t('quickActions.apply.button'),
      onClick: () => navigate('/auth/register'),
    },
    {
      icon: <School size={48} />,
      title: t('quickActions.schools.title'),
      description: t('quickActions.schools.description'),
      buttonText: t('quickActions.schools.button'),
      onClick: () => scrollToSection('schools'),
    },
    {
      icon: <MessageCircle size={48} />,
      title: t('quickActions.contact.title'),
      description: t('quickActions.contact.description'),
      buttonText: t('quickActions.contact.button'),
      onClick: () => scrollToSection('contact'),
    },
  ];

  return (
    <section id="media" className={`py-16 bg-gray-50 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('quickActions.title')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('quickActions.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {actions.map((action, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div className="text-[#1B365D] mb-6 group-hover:text-[#2563EB] transition-colors duration-300">
                {action.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {action.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {action.description}
              </p>
              <Button variant="primary" className="w-full" onClick={action.onClick}>
                {action.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickActions;
