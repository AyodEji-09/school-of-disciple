
const Hero = ({ title, tit, subtitle, color = '#000', bg = "hero.jpg", link, variant = 'main' }: { title: string; subtitle?: string, tit?: string, link?: string, bg?: string, color?: string, variant?: "main" | "sub" }) => {
  return (
    <>
    {variant === "main" && (
    <div className="relative py-52">
      <div className="absolute inset-0 overflow-hidden">
        <img src={link || `/images/${bg}`} alt="" className='object-cover w-full h-full' />
      </div>
      <div className={`absolute inset-0 opacity-70`} style={{backgroundColor: color}}></div>
      <div className="relative text-center container mx-auto space-y-4 px-4">
        <h1 className='text-white text-4xl md:text-5xl font-bold max-w-2xl uppercase mx-auto leading-16'>{tit}<span className="font-black"><br />{title}</span></h1>
        {subtitle && (
          <p className='text-white text-lg max-w-2xl mx-auto'>{subtitle}</p>
        )}
      </div>
    </div>
    )}
    {variant === "sub" && (
        <div className="relative py-52">
        <div className="absolute inset-0 overflow-hidden">
          <img src={link || `/images/${bg}`} alt="" className='object-cover w-full h-full' />
        </div>
        <div className={`absolute inset-0 opacity-70`} style={{backgroundColor: color}}></div>
        <div className="relative text-center container mx-auto space-y-4 px-4">
          <h1 className='text-white text-4xl font-bold max-w-2xl uppercase mx-auto leading-16'>{title}</h1>
          {subtitle && (
            <p className='text-white text-lg max-w-2xl mx-auto'>{subtitle}</p>
          )}
        </div>
      </div>
    )}
    </>
  );
};
export default Hero;
