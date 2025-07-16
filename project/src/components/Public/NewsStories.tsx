import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Story {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
}

const NewsStories: React.FC = () => {
  const { language, t } = useLanguage();

  const stories: Story[] = [
    {
      id: 1,
      title: t('news.story1.title'),
      excerpt: t('news.story1.excerpt'),
      image: 'https://images.pexels.com/photos/8613229/pexels-photo-8613229.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: '2024-01-15',
      category: t('news.category.achievement'),
    },
    {
      id: 2,
      title: t('news.story2.title'),
      excerpt: t('news.story2.excerpt'),
      image: 'https://images.pexels.com/photos/8613321/pexels-photo-8613321.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: '2024-01-12',
      category: t('news.category.training'),
    },
    {
      id: 3,
      title: t('news.story3.title'),
      excerpt: t('news.story3.excerpt'),
      image: 'https://images.pexels.com/photos/8613229/pexels-photo-8613229.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: '2024-01-10',
      category: t('news.category.training'),
    },
  ];

  return (
    <section id="news" className={`py-16 bg-white ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('news.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('news.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Story */}
          <div className="lg:row-span-2">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              <div className="relative">
                <img
                  src={stories[0].image}
                  alt={stories[0].title}
                  className="w-full h-64 lg:h-80 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#1B365D] text-white px-3 py-1 rounded-full text-sm font-medium">
                    {stories[0].category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <Calendar size={16} />
                  <span className="ml-2">
                    {new Date(stories[0].date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {stories[0].title}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {stories[0].excerpt}
                </p>

                <button className="inline-flex items-center text-[#1B365D] hover:text-[#2563EB] font-medium transition-colors duration-200">
                  {t('news.readMore')}
                  <ArrowRight size={16} className={`${language === 'ar' ? 'mr-1' : 'ml-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Side Stories */}
          <div className="space-y-6">
            {stories.slice(1).map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex">
                  <div className="w-1/3 relative">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-[#1B365D] text-white px-2 py-1 rounded-full text-xs font-medium">
                        {story.category}
                      </span>
                    </div>
                  </div>

                  <div className="w-2/3 p-4">
                    <div className="flex items-center text-gray-500 text-sm mb-2">
                      <Calendar size={14} />
                      <span className="ml-1">
                        {new Date(story.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#1B365D] transition-colors duration-200">
                      {story.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {story.excerpt}
                    </p>

                    <button className="inline-flex items-center text-[#1B365D] hover:text-[#2563EB] font-medium text-sm transition-colors duration-200">
                      {t('news.readMore')}
                      <ArrowRight size={14} className={`${language === 'ar' ? 'mr-1' : 'ml-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsStories;
