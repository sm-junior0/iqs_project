import React from 'react';
import { Instagram, Twitter, Linkedin, Github } from 'lucide-react';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from "react-router-dom";

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}

const Footer: React.FC = () => {
  const { language, t } = useLanguage();

  const footerLinks: {
    main: FooterLink[];
    services: FooterLink[];
    legal: FooterLink[];
  } = {
    main: [
      { label: t('footer.main.home'), href: '#home' },
      { label: t('footer.main.about'), href: '#about' },
      { label: t('footer.main.contact'), href: '#contact' },
      { label: t('footer.main.media'), href: '#media' }
    ],
    services: [
      { label: t('footer.services.authority'), href: '#authority' },
      { label: t('footer.services.accreditation'), href: '#accreditation' },
      { label: t('footer.services.schools'), href: '#schools' },
      { label: t('footer.services.training'), href: '#training' }
    ],
    legal: [
      { label: t('footer.legal.terms'), href: '#terms' },
      { label: t('footer.legal.privacy'), href: '#privacy' },
      { label: t('footer.legal.company'), href: '#company' }
    ]
  };

  const socialLinks: SocialLink[] = [
    { icon: <Instagram size={20} />, href: '#', label: 'Instagram' },
    { icon: <Twitter size={20} />, href: '#', label: 'Twitter' },
    { icon: <Linkedin size={20} />, href: '#', label: 'LinkedIn' },
    { icon: <Github size={20} />, href: '#', label: 'GitHub' }
  ];

  return (
    <footer className={`bg-[#1B365D] text-white ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Main Links */}
          <div className="space-y-4">
            <div className="text-2xl font-bold">IQS Authority</div>
            <nav className="flex flex-col space-y-2">
              {footerLinks.main.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-blue-200 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.services.title')}</h3>
            <nav className="flex flex-col space-y-2">
              {footerLinks.services.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-blue-200 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.legal.title')}</h3>
            <nav className="flex flex-col space-y-2">
              {footerLinks.legal.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-blue-200 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Register Button and Social */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.newsletter.title')}</h3>
              <p className="text-blue-200 text-sm mb-6">{t('footer.newsletter.subtitle')}</p>
              <Button variant="secondary" className="w-full max-w-xs mx-auto" asChild>
                <Link to="/auth/register">{t('footer.newsletter.button')}</Link>
                </Button>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">{t('footer.social.title')}</h4>
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="bg-blue-800 hover:bg-blue-700 p-2 rounded-full transition-colors duration-200"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-700 mt-12 pt-8 text-center text-blue-200 text-sm">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
