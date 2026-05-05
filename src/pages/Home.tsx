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
// import CourseCard from "../components/course-card/CourseCard";
import Itinerary from "../components/itinerary/Itinerary";
import { IoDiamondOutline } from "react-icons/io5";
import { IoLogoReact } from "react-icons/io5";
import { RiProfileLine } from "react-icons/ri";
import ParallaxSection from "../components/parallax-section/ParralaxSection";
// import ControlledAccordions from "../components/accordion/Accordion";

const Home = () => {
  const [searchParams] = useSearchParams();
  const paid = searchParams.get("success");
  // const regFaq = [
  //   {id: '1', title: "I didn't get a mail in my Inbox after signup.", text: "You will receive two mails after signup, one is welcoming you to the platform and the other contains a link for you to complete your sign up. Most times, the other might drop in your Promotions or Spam Folser because of the email confirmation link in the mail content."},
  //   {id: '2', title: "Is The School of Disciples limited to only RCCG Members?", text: "No, any Christian around the world who wants to know more about God and Himself can enroll."},
  //   {id: '3', title: "I can't find Refresher's Online Registration.", text: "For the meantime, our Refresher course are being done On-site, you can reach out to your Regional Coordinator for more. ."},
  // ]

  // const progFaq = [
  //   {id: '1', title: "Can I attend Executive Class Online?", text: "No, you can only sign up online and attend classes On-site"},
  //   {id: '2', title: "I have paid but want to postpone my course online.", text: "To postpone your course after payment, you must send a mail to info@rccgsod.com explaining reasons and your details."},
  //   {id: '3', title: "I am unable to download my Manual", text: "Yes, manuals are released at the end of each year (month) through your dashboard, you also have the option of paying ahead"},
  //   {id: '4', title: "How do I download my certificate?", text: "Students certificate are always available after completion of course via the dashboard."},
  // ]

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
            <MatricCard
              title="Session"
              text="10 years of extensive training"
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
            <img src="/images/Pastor5.jpg" alt="" className="h-auto" />
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
              U.S., offering both in-person and virtual meetings
            </p>
          </div>
        </div>
      </section>
      <section className="bg-[#121921] p-8">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 gap-8 ">
            {/* <MatricCard */}
            {/*   title="Learning" */}
            {/*   text="YOu can learn at your own pace" */}
            {/*   icon={<SlGraduation />} */}
            {/* /> */}
            <MatricCard
              title="Registration"
              text="Register and pay online"
              icon={<GoTrophy />}
            />
            {/* <MatricCard */}
            {/*   title="Certification" */}
            {/*   text="Earn a certificate online" */}
            {/*   icon={<FiTarget />} */}
            {/* /> */}
          </div>
        </div>
      </section>
      {/* <section className="p-8">
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
      </section> */}
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
          {/* <Itinerary */}
          {/*   icon={<IoLogoReact />} */}
          {/*   title="Online Lectures" */}
          {/*   text="We boast of trained, qualified and spirit filled trainers with experience who can hold your hand along the way" */}
          {/* /> */}
        </div>
      </section>
      {/* <section className="p-8 bg-[#f8f8f8]">
        <article className="text-center">
          <h1 className="font-medium text-[#333] text-3xl md:text-4xl">Frequently Asked Questions</h1>
        </article>
        <div>
          <div className="max-w-2xl mx-auto mt-8">
          <h1 className="font-medium text-[#333] text-3xl">Registration</h1>
          <ControlledAccordions items={regFaq} />
          </div>
        </div>
        <div>
          <div className="max-w-2xl mx-auto mt-8">
          <h1 className="font-medium text-[#333] text-3xl">Programmes</h1>
          <ControlledAccordions items={progFaq} />
          </div>
        </div>
        <div>
          <div className="max-w-2xl mx-auto mt-8">
          <h1 className="font-medium text-[#333] text-3xl">Payments</h1>
          <ControlledAccordions items={progFaq} />
          </div>
        </div>
      </section> */}
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
