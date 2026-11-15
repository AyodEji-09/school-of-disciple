import { type PropsWithChildren } from "react";

const DEFAULT_COMMUNITY_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDqtuw0RvwPU8bO0s34ejJbGFuPu-APo_6-gnoRMQRifHn6JG0DeNN6lzwVNuggXo8eGgq6vehadzmNUxKRGeiHmuWpvO7jpSgwHPFAs2Fw8oMMoxLvQ1zhXiPI3H1RF9hsEOQ-V_3awTEKRuhJqguMB6F2NPx_fk-ruyGtVdk17ynnaQErHkGa0wfLmCfeoBigkErRX0Yolfdg9yoaO7ILmGxvxAIktNJJGEw4I38";

const ParallaxSection = ({
  backgroundImage,
  children,
  height = "min-h-[300px] lg:min-h-[400px]",
}: PropsWithChildren<{ backgroundImage: string; height?: string }>) => {
  const imageUrl = backgroundImage.includes("unsplash.com")
    ? DEFAULT_COMMUNITY_IMG
    : backgroundImage;

  return (
    <section className="py-20 lg:py-24 bg-surface-container-lowest border-b border-bordergray">
      <div className="max-w-custom mx-auto px-space-lg lg:px-8">
        <div className="rounded-card overflow-hidden border border-bordergray grid grid-cols-1 lg:grid-cols-12 bg-navy">
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
            {children}
          </div>
          <div className={`lg:col-span-6 ${height}`}>
            <img
              src={imageUrl}
              alt="School of Disciples study group community"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParallaxSection;