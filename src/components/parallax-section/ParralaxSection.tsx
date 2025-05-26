import React, { type PropsWithChildren } from 'react';

const ParallaxSection = ({ backgroundImage, children, height = 'h-[500px]' }:PropsWithChildren<{backgroundImage: string, height?: string}>) => {
  return (
    <section
      className={`relative ${height} bg-cover bg-center bg-no-repeat`}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="relative z-10 bg-black/50 text-white h-full flex items-center justify-center px-6">
        {children}
      </div>
    </section>
  );
};

export default ParallaxSection;