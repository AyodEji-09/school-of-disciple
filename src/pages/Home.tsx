import { Button } from "@mui/material";
import Hero from "../components/hero/Hero";
// import TeamCard from "../components/team-card/TeamCard";
// import team from "../team";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";
import MatricCard from "../components/matrics/MatricCard";
import { SlGraduation } from "react-icons/sl";
import { GoTrophy } from "react-icons/go";
import { FiTarget } from "react-icons/fi";
import CourseCard from "../components/course-card/CourseCard";
import Itinerary from "../components/itinerary/Itinerary";
import { IoDiamondOutline } from "react-icons/io5";
import { IoLogoReact } from "react-icons/io5";
import { RiProfileLine } from "react-icons/ri";

const Home = () => {
  const [searchParams] = useSearchParams();
  const paid = searchParams.get("success");

  useEffect(() => {
    if (paid === "true") {
      toast.success("Payment successful");
    } else if (paid === "false") {
      toast.error("Payment failed, contact website host");
    }
  }, []);
  return (
    <div>
      <Hero
      tit="Welcome to "
        title="The School of Disciples"
        subtitle="Our mission is to nurture and develop future leaders who are grounded in biblical truth, filled with the Holy Spirit, and committed to serving their communities with excellence and compassion."
      />
      <section className="bg-[#121921] p-8">
        <div className="max-w-2xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <MatricCard title="Session" text="10 years of extensive training" icon={<SlGraduation />} />
          <MatricCard title="Modules" text="169 modules to be explored" icon={<GoTrophy />} />
          <MatricCard title="Enrollment" text="Over 100,000 enrollments" icon={<FiTarget />} />
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="h-80 overflow-hidden">
            <img src="/images/Pastor5.jpg" alt="" className="h-auto" />
          </div>
          <div className="space-y-2 self-center">
            <h2 className="text-2xl font-medium uppercase text-[#333]">Learn more about us</h2>
            <p className="text-sm text-[#555] leading-6">
              The School of Disciples, founded in 1985 by Pastor E.A. Adeboye,
              is an initiative by Christ the Redeemer’s Ministries under the
              Redeemed Christian Church of God (RCCG). It aims to train
              Christians from all denominations to become true disciples of
              Jesus Christ, fulfilling the command from John 14:12 to perform
              works like Jesus and even greater. The school focuses on practical
              training, including lectures from Pastor Adeboye, to equip
              believers for effective Christian living and service. It prepares
              them to become dynamic disciples and end-time soldiers of Christ.
              The School of Disciples RCCG Americas 1 has centers across the
              U.S., offering both in-person and virtual meetings
            </p>
          </div>
        </div>
      </section>
      <section className="bg-[#121921] p-8">
        <div className="max-w-2xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
          <MatricCard title="Learning" text="YOu can learn at your own pace" icon={<SlGraduation />} />
          <MatricCard title="Registration" text="Register and pay online" icon={<GoTrophy />} />
          <MatricCard title="Certification" text="Earn a certificate online" icon={<FiTarget />} />
          </div>
        </div>
      </section>
      <section className="p-8">
        <article className="text-center">
          <h1 className="font-medium text-[#333] text-3xl md:text-4xl">School of Disciple courses</h1>
          <p className="text-2xl font-light txt-[#555]">Achieve your goals with SOD</p>
          <div className="container mx-auto px-4 mt-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CourseCard lessons={15} title="Regular" />
            <CourseCard lessons={15} title="Executive" />
            <CourseCard lessons={15} title="Refresher" />
          </div>
          </div>
        </article>
      </section>
      <section className="relative py-16">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/images/bg_4.jpg.webp"
            className="w-full h-full object-cover object-center"
            alt=""
          />
        </div>
        <div className="absolute inset-0 overflow-hidden bg-[#372675] opacity-70"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-center flex-col gap-4 flex-wrap text-white">
            <p className="text-4xl font-bold text-center uppercase max-w-lg mx-auto">
              Take introductory class for free
            </p>
            <div className="w-fit mx-auto">
            <Button
              sx={{ height: 40, borderRadius: 20 }}
              variant="contained"
            >
              Register Here
            </Button>
            </div>
          </div>
        </div>
      </section>
      <section className="p-8 bg-[f8f8f8]">
      <article className="text-center">
      <h1 className="font-medium text-[#333] text-3xl md:text-4xl">School of Disciple itinerary</h1>
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <Itinerary icon={<IoDiamondOutline />} title="Our Instructors" text="We boast of trained, qualified and spirit filled trainers with experience who can hold your hand along the way"/>
        <Itinerary icon={<RiProfileLine />} title="Our Centers" text="We boast of trained, qualified and spirit filled trainers with experience who can hold your hand along the way"/>
        <Itinerary icon={<IoLogoReact />} title="Online Lectures" text="We boast of trained, qualified and spirit filled trainers with experience who can hold your hand along the way"/>
      </div>
      </article>
      </section>
      {/* <section className="py-16 container mx-auto px-4">
        <h1 className="text-center text-4xl font-semibold uppercase">
          Meet the team
        </h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((team) => (
            <TeamCard
              key={team.id}
              name={team.name}
              title={team.title}
              description={team.desc}
              img={team.img}
            />
          ))}
        </div>
      </section> */}
    </div>
  );
};

export default Home;
