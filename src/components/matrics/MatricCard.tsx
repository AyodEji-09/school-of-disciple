import type { JSX } from "react";
import { Link } from "react-router-dom";

const STAT_HEADLINES: Record<string, string> = {
  Session: "1 Year",
  Modules: "169",
  Enrollment: "100,000+",
};

const MatricCard = ({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: JSX.Element;
}) => {
  if (title.toLowerCase() === "registration") {
    return (
      <div className="bg-navy rounded-card p-8 sm:p-10 lg:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-ambient">
        <div>
          <span className="sr-only">{icon}</span>
          <p className="text-inverse-on-surface/75 text-xs uppercase tracking-widest font-semibold mb-1">
            ENROLLMENT OPEN
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-on-primary mb-2">
            {title}
          </h2>
          <p className="text-inverse-on-surface/85 text-sm sm:text-base max-w-xl">
            {text} to secure your seat for the next cohort.
          </p>
        </div>
        <div className="shrink-0 w-full md:w-auto">
          <Link
            to="/register"
            className="w-full md:w-auto inline-flex items-center justify-center h-12 px-8 bg-gold hover:bg-gold-hover text-navy font-semibold text-sm rounded-md tracking-wider transition-colors uppercase"
          >
            REGISTER NOW
          </Link>
        </div>
      </div>
    );
  }

  const statHeadline = STAT_HEADLINES[title] ?? title;

  return (
    <div className="flex flex-col items-center text-center min-w-[150px]">
      <span className="sr-only">{icon}</span>
      <p className="font-serif text-3xl sm:text-4xl font-bold text-navy mb-1.5">
        {statHeadline}
      </p>
      <p className="text-charcoal font-medium text-base">{title}</p>
      <p className="text-slate text-sm">{text}</p>
    </div>
  );
};

export default MatricCard;