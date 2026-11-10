import { Box } from "@mui/joy";
import type { PropsWithChildren } from "react";

type Props = { img?: string };

const DEFAULT_AUTH_STITCH_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDD4XjqwwlPdflwSKynlr8gavTV10B2MoEwN8JonKIR0jIQ_T1DAPEyrt0OYIdHwZJXAnPjqnyXjI9Y9RNsMdsXy_RhbyeB_guGcWYZ1zTqOj4NowaCvZSXgoGtbkAXPRGEaaQpgl5kWg6XgMwMufMq4Tla2KIKa2c0UGBvosX_N4AVA2luDVRIWLl4ZOXpRZpPkrmk_hdUwqQLCHfgi5doV83EgtOGlC5GwHKqK7A";

const UseBox = ({
  children,
  img = "manholding.jpg",
}: PropsWithChildren<Props>) => {
  const imageSrc = img.startsWith("http")
    ? img
    : img === "manholding.jpg"
      ? DEFAULT_AUTH_STITCH_IMG
      : `/images/${img}`;

  return (
    <Box component={"div"} className="w-full bg-surface-container-lowest">
      <div className="w-full max-w-[1440px] mx-auto min-h-[calc(100vh-5rem)] flex flex-col lg:flex-row bg-surface-container-lowest">
        <section className="w-full lg:w-1/2 flex items-center justify-center px-space-lg sm:px-margin py-12 lg:py-16 bg-surface-container-lowest">
          <div className="w-full max-w-[480px] flex flex-col">{children}</div>
        </section>

        <section className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 flex bg-coolgray">
          <div
            className="relative w-full h-full min-h-[420px] lg:min-h-full rounded-xl overflow-hidden bg-cover bg-center flex flex-col justify-between p-8 lg:p-12 shadow-ambient"
            style={{ backgroundImage: `url("${imageSrc}")` }}
          >
            <div className="absolute inset-0 bg-primary opacity-[0.32]" />
            <div className="relative z-10 self-start" />
            <div className="relative z-10 max-w-lg mt-auto">
              <div className="bg-surface-container-lowest/95 rounded-xl p-6 sm:p-7 border border-mist/60 shadow-ambient">
                <div className="w-12 h-1 bg-gold rounded-full mb-3.5" />
                <blockquote className="font-headline-sm text-headline-sm text-primary font-semibold leading-snug">
                  “Equipping disciples for fruitful ministry and spiritual
                  maturity.”
                </blockquote>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Box>
  );
};

export default UseBox;
