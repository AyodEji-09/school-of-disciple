
const Hero = ({ title, tit, subtitle }: { title: string; subtitle: string, tit: string }) => {
  return (
    <div className="relative py-52">
      <div className="absolute inset-0 overflow-hidden">
        <img src="/images/hero.jpg" alt="" className='object-cover w-full h-full' />
      </div>
      <div className="absolute inset-0 bg-black opacity-70"></div>
      <div className="relative text-center container mx-auto space-y-4 px-4">
        <h1 className='text-white text-4xl md:text-5xl font-bold max-w-2xl uppercase mx-auto leading-16'>{tit}<span className="font-black"><br />{title}</span></h1>
        <p className='text-white text-lg max-w-2xl mx-auto'>{subtitle}</p>
      </div>
    </div>
  );
};
export default Hero;
