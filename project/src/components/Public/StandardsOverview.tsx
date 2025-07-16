"use client"

import type React from "react"
import { CheckCircle, Target, ClipboardCheck, ArrowRight } from "lucide-react"
import { useLanguage } from "../../context/LanguageContext"

const StandardsOverview: React.FC = () => {
  const { language, t } = useLanguage()

  const standards = [
    {
      icon: <CheckCircle size={24} />,
      title: t("standards.what.title"),
      description: t("standards.what.description"),
      iconBg: "bg-[#10B981]",
    },
    {
      icon: <Target size={24} />,
      title: t("standards.why.title"),
      description: t("standards.why.description"),
      iconBg: "bg-[#2563EB]",
    },
    {
      icon: <ClipboardCheck size={24} />,
      title: t("standards.how.title"),
      description: t("standards.how.description"),
      iconBg: "bg-[#F97316]",
    },
  ]

  return (
    <section className={`py-16 lg:py-24 bg-white ${language === "ar" ? "rtl" : "ltr"}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{t("standards.title")}</h2>
          <p className="text-base text-gray-600 leading-relaxed">{t("standards.subtitle")}</p>
        </div>

        <div className="space-y-4 mb-12 w-full">
          {standards.map((standard, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-3xl p-6 flex items-center gap-6 hover:shadow-md transition-shadow duration-200 w-full"
            >
              <div className={`${standard.iconBg} p-4 rounded-full text-white flex-shrink-0`}>{standard.icon}</div>
              <div className="flex-1 min-w-0 w-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">{standard.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{standard.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <a
            href="/iqs-standard.pdf"
            download
            className="inline-flex items-center gap-2 bg-[#002855] hover:bg-[#001a3d] text-white font-medium rounded-3xl px-8 py-4 text-sm shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <span>{t("standards.readDocument")}</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}

export default StandardsOverview
