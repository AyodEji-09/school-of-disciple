const Hero = ({
  title,
  preTitle,
  subtitle,
  color = "#000",
  bg = "hero.jpg",
  link,
  variant = "main",
}: {
  title: string;
  subtitle?: string;
  preTitle?: string;
  link?: string;
  bg?: string;
  color?: string;
  variant?: "main" | "sub";
}) => {
  return (
    <div className="relative py-52">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={link || `/images/${bg}`}
          alt={`${title} hero background`}
          className="object-cover w-full h-full"
        />
      </div>
      <div
        className={`absolute inset-0 opacity-70`}
        style={{ backgroundColor: color }}
      ></div>
      <div className="relative text-center container mx-auto space-y-4 px-4">
        <h1 className={`text-white ${variant === "main" ? "text-4xl md:text-5xl" : "text-4xl"} font-bold max-w-2xl uppercase mx-auto leading-16`}>
          {variant === "main" && preTitle && (
            <>
              {preTitle}
              <br />
            </>
          )}
          <span className={variant === "main" ? "font-black" : ""}>
            {title}
          </span>
        </h1>
        {subtitle && (
          <p className="text-white text-lg max-w-2xl mx-auto">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
export default Hero;
