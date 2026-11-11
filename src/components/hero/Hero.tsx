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
        className="relative min-h-[520px] lg:min-h-[600px] py-24 lg:py-32 flex items-center border-b border-bordergray overflow-hidden"
        id="home"
      >
        {/* Background image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={imageSrc}
            alt="Believers gathering in church fellowship"
            loading="eager"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Color overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/75 to-navy/55 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-custom mx-auto px-space-lg lg:px-8 text-left">
          <div className="max-w-2xl">
            <h1 className="text-on-primary text-3xl sm:text-4xl lg:text-[48px] font-bold font-serif leading-[1.2] mb-6 uppercase">
              {title}
            </h1>
            {subtitle && (
              <p className="text-inverse-on-surface/90 text-body-lg leading-relaxed mb-9 font-normal max-w-xl">
                {subtitle}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center h-12 px-8 bg-gold hover:bg-gold-hover text-navy font-semibold text-sm rounded-md tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold"
              >
                Register Now
              </Link>
              <a
                href="#about"
                className="inline-flex items-center justify-center h-12 px-8 rounded-md border border-white/60 text-on-primary hover:bg-surface-container-lowest hover:text-navy text-sm font-medium transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="relative py-16 lg:py-20 bg-surface-container-lowest border-b border-bordergray overflow-hidden">
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
