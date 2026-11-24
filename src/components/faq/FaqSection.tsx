import { useMemo, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import {
  FAQ_CATEGORIES,
  FAQ_ITEMS,
  type FaqItem,
} from "../../data/faqData";

const CATEGORY_MAP = Object.fromEntries(
  FAQ_CATEGORIES.map((category) => [category.id, category]),
);

const CATEGORY_COUNTS = FAQ_CATEGORIES.reduce<Record<string, number>>(
  (acc, category) => {
    acc[category.id] = FAQ_ITEMS.filter(
      (item) => item.categoryId === category.id,
    ).length;
    return acc;
  },
  {},
);

/**
 * Categorized, searchable FAQ accordion section for the public landing page.
 */
const FaqSection = () => {
  const [activeCategory, setActiveCategory] = useState<string>(
    FAQ_CATEGORIES[0].id,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const visibleItems = useMemo(() => {
    if (isSearching) {
      return FAQ_ITEMS.filter((item) => {
        const category = CATEGORY_MAP[item.categoryId];
        const haystack = [
          item.question,
          ...item.paragraphs,
          category?.title ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      });
    }

    if (activeCategory === "all") {
      return FAQ_ITEMS;
    }

    return FAQ_ITEMS.filter((item) => item.categoryId === activeCategory);
  }, [activeCategory, isSearching, normalizedQuery]);

  const handleSelectCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    const firstItem =
      categoryId === "all"
        ? FAQ_ITEMS[0]
        : FAQ_ITEMS.find((item) => item.categoryId === categoryId);
    setOpenId(firstItem?.id ?? null);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const q = value.trim().toLowerCase();
    if (!q) {
      const firstInCategory =
        activeCategory === "all"
          ? FAQ_ITEMS[0]
          : FAQ_ITEMS.find((item) => item.categoryId === activeCategory);
      setOpenId(firstInCategory?.id ?? null);
      return;
    }
    const firstMatch = FAQ_ITEMS.find((item) =>
      [item.question, ...item.paragraphs, CATEGORY_MAP[item.categoryId]?.title ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
    setOpenId(firstMatch?.id ?? null);
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
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2
            id="faq-heading"
            className="font-semibold text-[#121921] text-3xl md:text-4xl"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[#555] leading-relaxed">
            Answers on School of Disciples admissions, center setup, fees and
            manuals, examinations, and graduation across RCCG Americas-1.
          </p>
        </div>

        {/* Search Input */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="relative">
            <SearchIcon
              fontSize="small"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search questions (e.g., fee, registration, exam, manuals, graduation)..."
              aria-label="Search frequently asked questions"
              className="w-full rounded-lg border border-[#D1D5DB] bg-white pl-10 pr-20 py-3 text-sm text-[#121921] placeholder:text-[#64748B] outline-none transition focus:border-[#001EC5] focus:ring-2 focus:ring-[#001EC5]/15"
            />
            {isSearching && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#001EC5] hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs (shown when not filtering by search query) */}
        {!isSearching ? (
          <div
            role="tablist"
            aria-label="FAQ categories"
            className="mt-6 flex flex-wrap justify-center gap-2"
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
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs sm:text-sm font-medium transition cursor-pointer ${
                    selected
                      ? "bg-[#121921] text-white shadow-xs"
                      : "bg-white text-[#333] border border-[#E5E7EB] hover:border-[#001EC5] hover:text-[#001EC5]"
                  }`}
                >
                  <span>{category.shortTitle}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
                      selected
                        ? "bg-[#FFC107] text-[#121921] font-semibold"
                        : "bg-[#F3F4F6] text-[#64748B]"
                    }`}
                  >
                    {CATEGORY_COUNTS[category.id] ?? 0}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === "all"}
              onClick={() => handleSelectCategory("all")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs sm:text-sm font-medium transition cursor-pointer ${
                activeCategory === "all"
                  ? "bg-[#121921] text-white shadow-xs"
                  : "bg-white text-[#333] border border-[#E5E7EB] hover:border-[#001EC5] hover:text-[#001EC5]"
              }`}
            >
              <span>All</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
                  activeCategory === "all"
                    ? "bg-[#FFC107] text-[#121921] font-semibold"
                    : "bg-[#F3F4F6] text-[#64748B]"
                }`}
              >
                {FAQ_ITEMS.length}
              </span>
            </button>
          </div>
        ) : (
          <div className="mt-5 flex items-center justify-between text-xs sm:text-sm text-[#555] px-1">
            <span>
              Showing{" "}
              <strong className="text-[#121921] tabular-nums">
                {visibleItems.length}
              </strong>{" "}
              matching {visibleItems.length === 1 ? "question" : "questions"}{" "}
              across all topics
            </span>
          </div>
        )}

        {/* Accordion List */}
        <div className="mt-6 space-y-3">
          {visibleItems.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-10 text-center space-y-3">
              <p className="text-sm sm:text-base text-[#555]">
                No FAQ entries matched "{searchQuery.trim()}".
              </p>
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="inline-flex items-center rounded-md bg-[#001F54] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#001EC5] transition-colors cursor-pointer"
              >
                Clear search
              </button>
            </div>
          ) : (
            visibleItems.map((item) => (
              <FaqAccordionRow
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                showCategoryTag={isSearching || activeCategory === "all"}
                categoryLabel={CATEGORY_MAP[item.categoryId]?.shortTitle ?? ""}
                onToggle={() => toggleItem(item.id)}
              />
            ))
          )}
        </div>

        {/* Contact Strip */}
        <div className="mt-8 bg-white border border-[#E5E7EB] rounded-lg px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#121921]">
              Still have questions about centers, enrollment, or exams?
            </p>
            <p className="text-xs sm:text-sm text-[#555] mt-0.5">
              Reach out to your local parish coordinator or the RCCGNA SOD
              Central Office directly.
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

type FaqAccordionRowProps = {
  item: FaqItem;
  isOpen: boolean;
  showCategoryTag: boolean;
  categoryLabel: string;
  onToggle: () => void;
};

const FaqAccordionRow = ({
  item,
  isOpen,
  showCategoryTag,
  categoryLabel,
  onToggle,
}: FaqAccordionRowProps) => {
  const buttonId = `faq-trigger-${item.id}`;
  const panelId = `faq-panel-${item.id}`;

  return (
    <div
      className={`bg-white border rounded-lg transition-colors ${
        isOpen ? "border-[#001EC5]/40" : "border-[#E5E7EB]"
      }`}
    >
      <h3 className="m-0">
        <button
          id={buttonId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#001EC5]"
        >
          <div className="flex flex-wrap items-center gap-2.5 min-w-0">
            {showCategoryTag && categoryLabel && (
              <span className="inline-flex items-center rounded-md bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-semibold text-[#001F54] shrink-0">
                {categoryLabel}
              </span>
            )}
            <span className="text-sm sm:text-base font-semibold text-[#121921]">
              {item.question}
            </span>
          </div>
          <ExpandMoreIcon
            aria-hidden="true"
            className={`shrink-0 text-[#555] transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#001EC5]" : ""
            }`}
          />
        </button>
      </h3>
      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="px-5 pb-5 pt-1 border-t border-[#F3F4F6] space-y-3 text-sm sm:text-[15px] text-[#555] leading-relaxed"
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
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#001EC5] bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#001EC5] hover:bg-[#EEF2FF] transition-colors"
                >
                  <span>{link.label}</span>
                  {link.external && <OpenInNewIcon sx={{ fontSize: 14 }} />}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FaqSection;
