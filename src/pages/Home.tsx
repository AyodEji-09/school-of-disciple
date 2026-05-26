import { Button } from "@mui/material";
import Hero from "../components/hero/Hero";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";
import MatricCard from "../components/matrics/MatricCard";
import { SlGraduation } from "react-icons/sl";
import { GoTrophy } from "react-icons/go";
import { FiTarget } from "react-icons/fi";
import Itinerary from "../components/itinerary/Itinerary";
import { IoDiamondOutline } from "react-icons/io5";
import { RiProfileLine } from "react-icons/ri";
import ParallaxSection from "../components/parallax-section/ParralaxSection";

const Home = () => {
  const [searchParams] = useSearchParams();
  const paid = searchParams.get("success");

  useEffect(() => {
    if (paid === "true") {
      toast.success("Payment successful");
    } else if (paid === "false") {
      toast.error("Payment failed, contact website host");
    }
  }, [paid]);

  return (
    <div>
      <Hero
        preTitle="Welcome to "
        title="The School of Disciples"
        subtitle="Our mission is to nurture and develop future leaders who are grounded in biblical truth, filled with the Holy Spirit, and committed to serving their communities with excellence and compassion."
      />
      <section className="bg-[#121921] p-8">
        <div className="max-w-2xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <MatricCard
              title="Session"
              text="1 year of extensive training"
              icon={<SlGraduation />}
            />
            <MatricCard
              title="Modules"
              text="169 modules to be explored"
              icon={<GoTrophy />}
            />
            <MatricCard
              title="Enrollment"
              text="Over 100,000 enrollments"
              icon={<FiTarget />}
            />
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="h-80 overflow-hidden">
            <img
              src="/images/Pastor5.jpg"
              alt="Pastor E.A. Adeboye preaching"
              className="h-auto"
            />
          </div>
          <div className="space-y-2 self-center">
            <h2 className="text-2xl font-medium uppercase text-[#333]">
              Learn more about us
            </h2>
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
              U.S., offering both in-person and virtual meetings.
            </p>
          </div>
        </div>
      </section>
      <section className="bg-[#121921] p-8">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 gap-8 ">
            <MatricCard
              title="Registration"
              text="Register and pay online"
              icon={<GoTrophy />}
            />
          </div>
        </div>
      </section>
      <section className="p-8 bg-[#f8f8f8]">
        <article className="text-center">
          <h1 className="font-medium text-[#333] text-3xl md:text-4xl">
            School of Disciple itinerary
          </h1>
        </article>
        <div className="grid md:grid-cols-2 max-w-5xl mx-auto place-items-center gap-4 mt-8">
          <Itinerary
            icon={<IoDiamondOutline />}
            title="Our Instructors"
            text="We boast of trained, qualified and spirit filled trainers with experience who can hold your hand along the way"
          />
          <Itinerary
            icon={<RiProfileLine />}
            title="Our Centers"
            text="We offer multiple accessible centers, each providing a welcoming environment and resources to support your spiritual growth."
          />
        </div>
      </section>
      <ParallaxSection backgroundImage="https://images.unsplash.com/photo-1634951401794-6c84f593db82?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D">
        <div className="absolute md:right-32 p-12 bg-[#121921] text-white max-w-sm">
          <article className="space-y-2">
            <h2 className="text-3xl font-semibold">
              School of disciples Learning Community
            </h2>
            <p className="text-sm">
              Join this community to understand more about the School of
              Disciples courses, how to enroll and our centres.
            </p>
          </article>
          <div className="mt-8">
            <Button sx={{ height: 40, borderRadius: 20 }} variant="contained">
              Read more
            </Button>
          </div>
        </div>
      </ParallaxSection>
    </div>
  );
};

export default Home;
