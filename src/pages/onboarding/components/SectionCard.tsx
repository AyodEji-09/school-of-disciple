import type { ReactNode } from "react";

const SectionCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) => (
  <div className="bg-surface-container-lowest border border-bordergray rounded-card shadow-sm overflow-hidden">
    <div className="border-b border-bordergray bg-[#fcfcfc] px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
      <h2 className="font-serif text-lg sm:text-xl font-bold text-navy leading-snug">
        {title}
      </h2>
      <p className="font-sans text-xs sm:text-sm text-slate mt-1 leading-relaxed">
        {subtitle}
      </p>
    </div>
    <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      {children}
    </div>
  </div>
);

export default SectionCard;
