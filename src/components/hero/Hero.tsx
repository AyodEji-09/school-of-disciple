import herobg from '../../assets/images/hero.jpg'

const Hero = ({ title, subtitle }: { title: string; subtitle: string }) => {
  return (
    <div className="relative py-36">
      <div className="absolute inset-0 overflow-hidden">
        <img src={herobg} alt="" className='object-cover w-full h-full' />
      </div>
      <div className="absolute inset-0 bg-black opacity-70"></div>
      <div className="relative text-center container mx-auto space-y-4 px-4">
        <h1 className='text-[#25c325] text-4xl md:text-6xl font-black'>{title}</h1>
        <p className='text-white text-sm md:text-lg'>{subtitle}</p>
      </div>
    </div>
  );
};
export default Hero;
