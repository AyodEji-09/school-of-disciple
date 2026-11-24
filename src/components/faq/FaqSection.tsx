import { useMemo, useState } from "react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { FAQ_CATEGORIES, FAQ_ITEMS } from "../../data/faqData";

/**
 * Categorized FAQ accordion section for the public landing page.
 */
const FaqSection = () => {
  const [activeCategory, setActiveCategory] = useState<string>(
    FAQ_CATEGORIES[0].id,
  );
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

  const visibleItems = useMemo(
    () => FAQ_ITEMS.filter((item) => item.categoryId === activeCategory),
    [activeCategory],
  );

  const handleSelectCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    const firstItem = FAQ_ITEMS.find((item) => item.categoryId === categoryId);
    setOpenId(firstItem?.id ?? null);
  };

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-[#f8f8f8] py-16 px-4 border-t border-[#E5E7EB] scroll-mt-24"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center space-y-2.5">
          <h2
            id="faq-heading"
            className="font-semibold text-[#001F54] text-3xl md:text-4xl"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[#555] leading-relaxed">
            Everything prospective and enrolled students need to know about the
            School of Disciples.
          </p>
        </div>

        <div className="mt-7 bg-white border border-[#E5E7EB] rounded-md overflow-hidden">
          <div className="px-5 bg-white border-b border-[#E5E7EB] overflow-x-auto scrollbar-hide">
            <div
              role="tablist"
              aria-label="FAQ categories"
              className="flex items-center gap-5 whitespace-nowrap"
            >
              {FAQ_CATEGORIES.map((category) => {
                const selected = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => handleSelectCategory(category.id)}
                    className={`py-3 text-xs sm:text-sm border-b-2 transition-colors cursor-pointer shrink-0 ${
                      selected
                        ? "border-[#001EC5] text-[#001F54] font-semibold"
                        : "border-transparent text-[#555] font-medium hover:text-[#001EC5]"
                    }`}
                  >
                    {category.shortTitle}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="divide-y divide-[#F3F4F6]">
            {visibleItems.map((item) => {
              const isOpen = openId === item.id;
              const buttonId = `faq-trigger-${item.id}`;
              const panelId = `faq-panel-${item.id}`;
              return (
                <div key={item.id}>
                  <h3 className="m-0">
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggleItem(item.id)}
                      className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-[#F3F4F6]/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#001EC5]"
                    >
                      <span className="text-sm sm:text-base font-semibold text-[#121921]">
                        {item.question}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold shrink-0 transition-colors ${
                          isOpen
                            ? "bg-[#001EC5] text-white"
                            : "bg-[#F3F4F6] text-[#001F54]"
                        }`}
                      >
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                  </h3>
                  {isOpen && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="px-5 pb-5 pt-1 space-y-3 text-sm sm:text-sm text-[#333] leading-relaxed"
                    >
                      {item.paragraphs.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                      {item.links && item.links.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-2.5">
                          {item.links.map((link) => (
                            <a
                              key={link.href}
                              href={link.href}
                              target={link.external ? "_blank" : undefined}
                              rel={
                                link.external
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                              className="inline-flex items-center gap-1.5 rounded-md border border-[#001EC5] bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#001EC5] hover:bg-[#EEF2FF] transition-colors"
                            >
                              <span>{link.label}</span>
                              {link.external && (
                                <OpenInNewIcon sx={{ fontSize: 14 }} />
                              )}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 bg-[#001F54] text-white border border-[#001F54] rounded-md px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm sm:text-base font-semibold">
              Still have questions about centers, enrollment, or exams?
            </p>
            <p className="text-white/80 text-xs sm:text-sm mt-0.5">
              Contact your center coordinator or reach the RCCGNA SOD Central
              Office directly.
            </p>
          </div>
          <a
            href="mailto:info@rccgnasod.org"
            className="inline-flex items-center justify-center shrink-0 rounded-full bg-[#FFC107] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#121921] hover:brightness-95 transition"
          >
            info@rccgnasod.org
          </a>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
