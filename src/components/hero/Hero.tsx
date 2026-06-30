interface HeroProps {
  title: string;
  subtitle?: string;
  preTitle?: string;
  link?: string;
  bg?: string;
  color?: string;
  variant?: "main" | "sub";
}

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

  return (
    <div className="relative py-52">
      {/* Background image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={link || `/images/${bg}`}
          alt={`${title} hero background`}
          loading="eager"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Color overlay */}
      <div
        className="absolute inset-0 opacity-70"
        style={{ backgroundColor: color }}
      />

      {/* Content */}
      <div className="relative text-center container mx-auto px-4">
        {isMain && preTitle && (
          <p className="text-white/60 text-sm md:text-base font-medium tracking-[0.3em] uppercase mb-4">
            {preTitle}
          </p>
        )}
        <h1
          className={`text-white ${isMain ? "text-4xl md:text-5xl lg:text-6xl" : "text-4xl"} font-bold max-w-4xl uppercase mx-auto leading-tight`}
        >
          <span className={isMain ? "font-black tracking-wide" : ""}>
            {title}
          </span>
        </h1>
        {subtitle && (
          <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-3xl mx-auto mt-6">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
export default Hero;
