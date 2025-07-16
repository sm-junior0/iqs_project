import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

const translations = {
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.iqsStandard': 'IQS Standard',
    'nav.accreditation': 'Accreditation',
    'nav.certifiedSchools': 'Certified Schools',
    'nav.training': 'Training',
    'nav.media': 'Media',
    'nav.news': 'News',
    'nav.contact': 'Contact',
    'nav.applyAccreditation': 'Apply for Accreditation',
    'nav.login': 'Login',
    'nav.logout': 'Logout',

    // Hero Section
    'hero.title': 'Quality You Can Trust in',
    'hero.titleHighlight': 'Qur\'anic Education',
    'hero.subtitle': 'Empowering schools and training coordinators worldwide with structured accreditation and capacity-building.',
    'hero.getStarted': 'Get Started',
    'hero.watchVideo': 'Watch Video',

    // Stats Section
    'stats.students': 'Serving 15+ Students',
    'stats.schools': '50+ Partnered Schools',
    'stats.teachers': '3k successfully trained teachers',
    'stats.applyAccreditation': 'Apply for Accreditation →',

    // Quick Actions
    'quickActions.title': 'Quick Actions',
    'quickActions.subtitle': 'View quick actions on how our system works and get to know how we work day by day',
    'quickActions.apply.title': 'Apply For Accreditation',
    'quickActions.apply.description': 'Start now and enable your school to access our programs.',
    'quickActions.apply.button': 'Apply Now',
    'quickActions.schools.title': 'View Certified Schools',
    'quickActions.schools.description': 'See the List of all schools that we are working together on our system.',
    'quickActions.schools.button': 'View Schools',
    'quickActions.contact.title': 'Contact Us',
    'quickActions.contact.description': 'Get in contact with us and our team behind this system.',
    'quickActions.contact.button': 'Contact Us',

    // News Stories
    'news.title': 'News & Success Stories',
    'news.subtitle': 'View recent news and successfully stories from the schools who are accessing and using our platform and what did our accreditation help them in their school wellbeing',
    'news.readMore': 'Read more',
    'news.story1.title': 'Al Noor Institute Achieves Top Score',
    'news.story1.excerpt': 'Al Noor implemented IQS standards and became one of the top accredited institutions this week when they were able to make it in their final rounds and this is one of the biggest achievements to bring made by them.',
    'news.story2.title': 'Training in Nairobi Completed',
    'news.story2.excerpt': 'Al Noor implemented IQS standards and became one of the top accredited institutions.',
    'news.story3.title': 'Training in Nairobi Completed',
    'news.story3.excerpt': 'Al Noor implemented IQS standards and became one of the top accredited institutions.',
    'news.category.achievement': 'Achievement',
    'news.category.training': 'Training',

    // Standards Overview
    'standards.title': 'IQS Standards Overview',
    'standards.subtitle': 'Get a quick overview of what we base on and what are our standards for a certain school to be accredited',
    'standards.what.title': 'What is the IQS Standard?',
    'standards.what.description': 'A globally recognised framework that defines quality and operational excellence for Qur\'anic schools.',
    'standards.why.title': 'Why It\'s Important',
    'standards.why.description': 'It builds trust, ensures high educational standards, and connects schools to a certified global network.',
    'standards.how.title': 'How Schools Are Evaluated',
    'standards.how.description': 'Schools apply online, upload documents, undergo evaluation by certified experts, and receive accreditation if standards are met.',
    'standards.readDocument': 'Read the full IQS Standard Document',

    // Certified Schools
    'certifiedSchools.title': 'Certified Schools',
    'certifiedSchools.subtitle': 'Proud to work with these outstanding educational institutions',

    // Contact Section
    'contact.title': 'Contact Us',
    'contact.subtitle': 'Want to talk with us and get the accreditation just contact us on this pages',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.connect': 'Connect with us',
    'contact.form.fullName': 'Full Name',
    'contact.form.fullNamePlaceholder': 'Enter your full name',
    'contact.form.email': 'Email',
    'contact.form.emailPlaceholder': 'Enter your email address',
    'contact.form.message': 'Message',
    'contact.form.messagePlaceholder': 'Enter your message',
    'contact.form.submit': 'Submit',

    // Footer
    'footer.main.home': 'Home',
    'footer.main.about': 'About',
    'footer.main.contact': 'Contact',
    'footer.main.media': 'Media and News',
    'footer.services.title': 'Services',
    'footer.services.authority': 'IQS Authority',
    'footer.services.accreditation': 'Accreditation',
    'footer.services.schools': 'Certified Schools',
    'footer.services.training': 'Training',
    'footer.legal.title': 'Legal',
    'footer.legal.terms': 'Terms of Use',
    'footer.legal.privacy': 'Privacy Policy',
    'footer.legal.company': 'Accreditation Company',
    'footer.newsletter.title': 'Connect with our team',
    'footer.newsletter.subtitle': 'Stay up to date with IQS Authority. Sign up for our newsletter.',
    'footer.newsletter.placeholder': 'Enter your email',
    'footer.newsletter.button': 'Register Now',
    'footer.social.title': 'Manage Contact Preferences',
    'footer.copyright': '© 2024 IQS Authority. Subject to offering.',
  },
  ar: {
    // Navbar
    'nav.home': 'الرئيسية',
    'nav.about': 'حول',
    'nav.iqsStandard': 'معيار IQS',
    'nav.accreditation': 'الاعتماد',
    'nav.certifiedSchools': 'المدارس المعتمدة',
    'nav.training': 'التدريب',
    'nav.media': 'الإعلام',
    'nav.news': 'الأخبار',
    'nav.contact': 'اتصل بنا',
    'nav.applyAccreditation': 'تقدم للاعتماد',
    'nav.login': 'تسجيل الدخول',
    'nav.logout': 'تسجيل الخروج',

    // Hero Section
    'hero.title': 'جودة يمكنك الوثوق بها في',
    'hero.titleHighlight': 'التعليم القرآني',
    'hero.subtitle': 'تمكين المدارس ومنسقي التدريب في جميع أنحاء العالم من خلال الاعتماد المنظم وبناء القدرات.',
    'hero.getStarted': 'ابدأ الآن',
    'hero.watchVideo': 'شاهد الفيديو',

    // Stats Section
    'stats.students': 'نخدم أكثر من 15 طالب',
    'stats.schools': 'أكثر من 50 مدرسة شريكة',
    'stats.teachers': '3 آلاف معلم مدرب بنجاح',
    'stats.applyAccreditation': 'تقدم للاعتماد ←',

    // Quick Actions
    'quickActions.title': 'الإجراءات السريعة',
    'quickActions.subtitle': 'اطلع على الإجراءات السريعة حول كيفية عمل نظامنا وتعرف على كيفية عملنا يوماً بعد يوم',
    'quickActions.apply.title': 'تقدم للاعتماد',
    'quickActions.apply.description': 'ابدأ الآن ومكّن مدرستك من الوصول إلى برامجنا.',
    'quickActions.apply.button': 'تقدم الآن',
    'quickActions.schools.title': 'عرض المدارس المعتمدة',
    'quickActions.schools.description': 'اطلع على قائمة جميع المدارس التي نعمل معها في نظامنا.',
    'quickActions.schools.button': 'عرض المدارس',
    'quickActions.contact.title': 'اتصل بنا',
    'quickActions.contact.description': 'تواصل معنا ومع فريقنا وراء هذا النظام.',
    'quickActions.contact.button': 'اتصل بنا',

    // News Stories
    'news.title': 'الأخبار وقصص النجاح',
    'news.subtitle': 'اطلع على الأخبار الحديثة وقصص النجاح من المدارس التي تستخدم منصتنا وكيف ساعدهم اعتمادنا في رفاهية مدارسهم',
    'news.readMore': 'اقرأ المزيد',
    'news.story1.title': 'معهد النور يحقق أعلى النتائج',
    'news.story1.excerpt': 'طبق معهد النور معايير IQS وأصبح واحداً من أفضل المؤسسات المعتمدة هذا الأسبوع عندما تمكن من الوصول إلى الجولات النهائية وهذا واحد من أكبر الإنجازات التي حققها.',
    'news.story2.title': 'اكتمال التدريب في نيروبي',
    'news.story2.excerpt': 'طبق معهد النور معايير IQS وأصبح واحداً من أفضل المؤسسات المعتمدة.',
    'news.story3.title': 'اكتمال التدريب في نيروبي',
    'news.story3.excerpt': 'طبق معهد النور معايير IQS وأصبح واحداً من أفضل المؤسسات المعتمدة.',
    'news.category.achievement': 'إنجاز',
    'news.category.training': 'تدريب',

    // Standards Overview
    'standards.title': 'نظرة عامة على معايير IQS',
    'standards.subtitle': 'احصل على نظرة عامة سريعة على ما نعتمد عليه وما هي معاييرنا لاعتماد مدرسة معينة',
    'standards.what.title': 'ما هو معيار IQS؟',
    'standards.what.description': 'إطار عمل معترف به عالمياً يحدد الجودة والتميز التشغيلي للمدارس القرآنية.',
    'standards.why.title': 'لماذا هو مهم',
    'standards.why.description': 'يبني الثقة ويضمن معايير تعليمية عالية ويربط المدارس بشبكة عالمية معتمدة.',
    'standards.how.title': 'كيف يتم تقييم المدارس',
    'standards.how.description': 'تتقدم المدارس عبر الإنترنت وترفع الوثائق وتخضع للتقييم من قبل خبراء معتمدين وتحصل على الاعتماد إذا تم استيفاء المعايير.',
    'standards.readDocument': 'اقرأ وثيقة معيار IQS الكاملة',

    // Certified Schools
    'certifiedSchools.title': 'المدارس المعتمدة',
    'certifiedSchools.subtitle': 'فخورون بالعمل مع هذه المؤسسات التعليمية المتميزة',

    // Contact Section
    'contact.title': 'اتصل بنا',
    'contact.subtitle': 'تريد التحدث معنا والحصول على الاعتماد فقط اتصل بنا في هذه الصفحات',
    'contact.phone': 'الهاتف',
    'contact.email': 'البريد الإلكتروني',
    'contact.connect': 'تواصل معنا',
    'contact.form.fullName': 'الاسم الكامل',
    'contact.form.fullNamePlaceholder': 'أدخل اسمك الكامل',
    'contact.form.email': 'البريد الإلكتروني',
    'contact.form.emailPlaceholder': 'أدخل عنوان بريدك الإلكتروني',
    'contact.form.message': 'الرسالة',
    'contact.form.messagePlaceholder': 'أدخل رسالتك',
    'contact.form.submit': 'إرسال',

    // Footer
    'footer.main.home': 'الرئيسية',
    'footer.main.about': 'حول',
    'footer.main.contact': 'اتصل بنا',
    'footer.main.media': 'الإعلام والأخبار',
    'footer.services.title': 'الخدمات',
    'footer.services.authority': 'سلطة IQS',
    'footer.services.accreditation': 'الاعتماد',
    'footer.services.schools': 'المدارس المعتمدة',
    'footer.services.training': 'التدريب',
    'footer.legal.title': 'قانوني',
    'footer.legal.terms': 'شروط الاستخدام',
    'footer.legal.privacy': 'سياسة الخصوصية',
    'footer.legal.company': 'شركة الاعتماد',
    'footer.newsletter.title': 'تواصل مع فريقنا',
    'footer.newsletter.subtitle': 'ابق على اطلاع بأحدث أخبار سلطة IQS. اشترك في نشرتنا الإخبارية.',
    'footer.newsletter.placeholder': 'أدخل بريدك الإلكتروني',
    'footer.newsletter.button': 'سجل الآن',
    'footer.social.title': 'إدارة تفضيلات الاتصال',
    'footer.copyright': '© 2024 سلطة IQS. عرضة للعرض.',
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};