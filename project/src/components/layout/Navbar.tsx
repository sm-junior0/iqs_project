import React, { useState } from 'react';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext'; // Language context hook
import { Link } from "react-router-dom";

interface MenuItem {
  label: string;
  href: string;
  active?: boolean;
}

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const { language, setLanguage, t } = useLanguage();

  const menuItems: MenuItem[] = [
    { label: t('nav.home'), href: '#home', active: true },
    { label: t('nav.about'), href: '#about' },
    { label: t('nav.iqsStandard'), href: '#standard' },
    { label: t('nav.accreditation'), href: '#accreditation' },
    { label: t('nav.certifiedSchools'), href: '#schools' },
    { label: t('nav.media'), href: '#media' },
    { label: t('nav.news'), href: '#news' },
    { label: t('nav.contact'), href: '#contact' },
  ];

  const toggleLanguage = (): void => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  // Smooth scroll handler
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.getElementById(href.substring(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
      }
    }
  };

  return (
    <nav className="bg-[#002855] w-full h-[70px] opacity-100 sticky top-0 z-50">
      <style>{`html { scroll-behavior: smooth; }`}</style>
      <div className="max-w-screen-2xl mx-auto px-2 md:px-4 flex items-center justify-between h-[70px] min-w-0" style={{ width: '100%' }}>
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
          <div className="text-xl font-bold text-white">IQS Authority</div>
          </div>

          {/* Desktop Menu */}
        <div className="hidden xl:flex items-center space-x-2">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
              onClick={e => handleSmoothScroll(e, item.href)}
              className={`px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md whitespace-nowrap ${
                item.active ? 'text-white' : 'text-white/80 hover:text-white'
              }`}
              style={{ height: '70px', display: 'flex', alignItems: 'center' }}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden xl:flex items-center space-x-3">
          <a
            href="/auth/register"
            className="bg-white text-[#002855] font-medium rounded-full transition-all duration-200 px-6 text-sm border-none focus:outline-none flex items-center justify-center text-center h-12"
            style={{ width: '180px' }}
          >
            {t('nav.applyAccreditation')}
          </a>

          <Link
            to="/auth/login"
            className="border border-white text-white font-medium rounded-full transition-all duration-200 px-6 h-9 text-sm bg-transparent hover:bg-white hover:text-[#002855] flex items-center justify-center"
            style={{ width: '100px', height: '40px' }}
          >
            {t('nav.login')}
          </Link>

            <button
              onClick={toggleLanguage}
            className="flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium text-white/80 hover:text-white transition-colors duration-200 bg-transparent"
            >
              <Globe size={16} />
            <span>{language === 'en' ? 'EN' : 'AR'}</span>
            <ChevronDown size={16} className="ml-1" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="xl:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white/80 hover:text-white p-2 rounded-md transition-colors duration-200"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
        <div className="xl:hidden bg-[#002855] rounded-b-lg p-4 shadow-xl border-t border-white/10">
            <div className="flex flex-col space-y-2">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                onClick={e => handleSmoothScroll(e, item.href)}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  item.active ? 'text-white bg-[#003366]' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            <div className="border-t border-white/10 pt-4 mt-4 flex flex-col space-y-3">
                <button
                  onClick={toggleLanguage}
                className="flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:text-white transition-colors duration-200"
                >
                  <Globe size={16} />
                <span>{language === 'en' ? 'EN' : 'AR'}</span>
                <ChevronDown size={16} className="ml-1" />
                </button>
              <a
                href="/auth/register"
                className="bg-white text-[#002855] font-medium rounded-full transition-all duration-200 px-6 text-sm border-none focus:outline-none flex items-center justify-center h-full"
                style={{ width: '180px' }}
                >
                {t('nav.applyAccreditation')}
              </a>
              <Link
                to="/auth/login"
                className="border border-white text-white font-medium rounded-full transition-all duration-200 px-6 h-9 text-sm bg-transparent hover:bg-white hover:text-[#002855] flex items-center justify-center"
                style={{ width: '100px', height: '40px' }}
                >
                {t('nav.login')}
              </Link>
              </div>
            </div>
          </div>
        )}
    </nav>
  );
};

export default Navbar;
