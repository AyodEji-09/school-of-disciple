import * as React from "react";

export type ItemType = {
  id: string;
  title: string;
  text: string;
};

export default function ControlledAccordions({ items }: { items: ItemType[] }) {
  const [expanded, setExpanded] = React.useState<string | false>(
    items[0]?.id ?? false,
  );

  const handleChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <div
      className="divide-y divide-bordergray border-y border-bordergray bg-surface-container-lowest rounded-card overflow-hidden"
      data-purpose="accordion-group"
    >
      {items.map((item) => {
        const isOpen = expanded === item.id;
        return (
          <div key={item.id} className="p-6">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={(e) => handleChange(item.id)(e, !isOpen)}
              className="w-full text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
            >
              <span className="font-serif font-bold text-navy text-lg sm:text-[18px]">
                {item.title}
              </span>
              <span className="text-navy shrink-0">
                {isOpen ? (
                  <svg
                    className="w-5 h-5 faq-icon-minus"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19.5 12h-15"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 4.5v15m7.5-7.5h-15"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
            </button>
            {isOpen && (
              <div
                className="text-charcoal text-base leading-relaxed pt-4 max-w-xl"
                style={{ maxWidth: "560px" }}
              >
                {item.text}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
