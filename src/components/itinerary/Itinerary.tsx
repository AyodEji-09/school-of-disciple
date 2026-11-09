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
  return (
    <div className="bg-surface-container-lowest rounded-card p-8 border border-bordergray flex flex-col justify-start text-left w-full h-full">
      <span className="sr-only">{icon}</span>
      <h3 className="font-serif text-xl font-bold text-navy mb-3 uppercase tracking-tight">
        {title}
      </h3>
      <p className="text-charcoal/90 text-base leading-relaxed">{text}</p>
    </div>
  );
};

export default Itinerary;