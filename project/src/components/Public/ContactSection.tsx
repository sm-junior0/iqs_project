import React, { useState } from 'react';
import { Phone, Mail, Instagram, Twitter } from 'lucide-react';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';

interface FormData {
  fullName: string;
  email: string;
  message: string;
}

const ContactSection: React.FC = () => {
  const { language, t } = useLanguage();

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert(t('contact.form.thankYouMessage') || 'Thank you for your message! We will get back to you soon.');
    setFormData({ fullName: '', email: '', message: '' });
  };

  return (
    <section id='contact' className={`py-16 bg-gray-50 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('contact.title')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="bg-[#1B365D] p-3 rounded-full">
                <Phone size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('contact.phone')}</h3>
                <p className="text-gray-600">+012 345 6789</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-[#1B365D] p-3 rounded-full">
                <Mail size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('contact.email')}</h3>
                <p className="text-gray-600">IqsAuthority@gmail.com</p>
              </div>
            </div>

            <div className="pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('contact.connect')}</h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="bg-[#1B365D] hover:bg-[#2563EB] p-3 rounded-full transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <Instagram size={24} className="text-white" />
                </a>
                <a
                  href="#"
                  className="bg-[#1B365D] hover:bg-[#2563EB] p-3 rounded-full transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <Twitter size={24} className="text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="fullName"
                  className={`block text-sm font-medium text-gray-700 mb-2 ${
                    language === 'ar' ? 'text-right' : 'text-left'
                  }`}
                >
                  {t('contact.form.fullName')}
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent outline-none transition-all duration-200"
                  placeholder={t('contact.form.fullNamePlaceholder')}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium text-gray-700 mb-2 ${
                    language === 'ar' ? 'text-right' : 'text-left'
                  }`}
                >
                  {t('contact.form.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent outline-none transition-all duration-200"
                  placeholder={t('contact.form.emailPlaceholder')}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className={`block text-sm font-medium text-gray-700 mb-2 ${
                    language === 'ar' ? 'text-right' : 'text-left'
                  }`}
                >
                  {t('contact.form.message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent outline-none transition-all duration-200 resize-none"
                  placeholder={t('contact.form.messagePlaceholder')}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                {t('contact.form.submit')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
