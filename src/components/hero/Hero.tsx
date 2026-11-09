import { Link } from "react-router-dom";

interface HeroProps {
  title: string;
  subtitle?: string;
  preTitle?: string;
  link?: string;
  bg?: string;
  color?: string;
  variant?: "main" | "sub";
}

const DEFAULT_STITCH_HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDqtuw0RvwPU8bO0s34ejJbGFuPu-APo_6-gnoRMQRifHn6JG0DeNN6lzwVNuggXo8eGgq6vehadzmNUxKRGeiHmuWpvO7jpSgwHPFAs2Fw8oMMoxLvQ1zhXiPI3H1RF9hsEOQ-V_3awTEKRuhJqguMB6F2NPx_fk-ruyGtVdk17ynnaQErHkGa0wfLmCfeoBigkErRX0Yolfdg9yoaO7ILmGxvxAIktNJJGEw4I38";

const Hero = ({
  title,
  preTitle,
  subtitle,
  color = "#000",
  bg = "hero.jpg",
  link,
  variant = "main",
}: HeroProps) => {
  const isMain = variant === "main";
  const imageSrc =
    link || (bg !== "hero.jpg" ? `/images/${bg}` : DEFAULT_STITCH_HERO_IMG);

  if (isMain && preTitle) {
    return (
      <section
        className="bg-surface-container-lowest py-16 lg:py-24 border-b border-bordergray"
        id="home"
      >
        {/* Background image */}
        {/* Color overlay */}
        {/* Content */}
        <div className="max-w-custom mx-auto px-space-lg lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-slate text-xs uppercase tracking-widest font-semibold mb-4">
                {preTitle}
              </p>
              <h1 className="text-navy text-3xl sm:text-4xl lg:text-[44px] font-bold font-serif leading-[1.2] mb-6 uppercase">
                {title}
              </h1>
              {subtitle && (
                <p className="text-charcoal text-body-lg leading-relaxed mb-8 font-normal max-w-xl">
                  {subtitle}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center h-12 px-7 bg-navy hover:bg-navy-light text-on-primary font-semibold text-sm rounded-md tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy"
                >
                  Register Now
                </Link>
                <a
                  href="#about"
                  className="inline-flex items-center justify-center h-12 px-7 rounded-md border border-bordergray text-navy hover:bg-coolgray text-sm font-medium transition-colors"
                >
                  Learn More
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="w-full aspect-4/3 rounded-card overflow-hidden border border-bordergray shadow-ambient bg-coolgray">
                <img
                  src={imageSrc}
                  alt="Believers gathering in church fellowship"
                  loading="eager"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="relative py-20 lg:py-24 bg-surface-container-low border-b border-bordergray overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <img
          src={link || `/images/${bg}`}
          alt={`${title} hero background`}
          loading="eager"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Color overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      {/* Content */}
      <div className="relative max-w-custom mx-auto px-space-lg lg:px-8 text-left">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-[2px] bg-gold shrink-0" />
          <span className="text-gold text-label-md uppercase tracking-widest font-medium">
            {preTitle || "RCCG The Americas-1"}
          </span>
        </div>
        <h1
          className={`text-navy font-serif ${isMain ? "text-display-lg-mobile lg:text-display-lg" : "text-headline-lg lg:text-display-lg"} font-bold max-w-4xl leading-tight`}
        >
          <span>{title}</span>
        </h1>
        {subtitle && (
          <p className="text-on-surface-variant text-body-lg leading-relaxed max-w-2xl mt-4">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
export default Hero;
