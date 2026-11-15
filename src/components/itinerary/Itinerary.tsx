import type { JSX } from "react";

const Itinerary = ({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: JSX.Element;
}) => {
  const isInstructors = title.toLowerCase().includes("instructor");

  return (
    <div className="bg-surface-container-lowest rounded-card p-8 border border-bordergray flex flex-col justify-start text-left w-full h-full">
      <span className="sr-only">{icon}</span>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-navy shrink-0">
          {isInstructors ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect height="20" rx="2" ry="2" width="20" x="2" y="2" />
              <path d="M7 2v20" />
              <path d="M17 2v20" />
              <path d="M2 12h20" />
              <path d="M2 7h5" />
              <path d="M2 17h5" />
              <path d="M17 17h5" />
              <path d="M17 7h5" />
            </svg>
          )}
        </span>
        <h3 className="font-serif text-xl font-bold text-navy uppercase tracking-tight">
          {title}
        </h3>
      </div>
      <p className="text-charcoal/90 text-base leading-relaxed">{text}</p>
    </div>
  );
};

export default Itinerary;