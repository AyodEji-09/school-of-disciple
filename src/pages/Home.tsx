import Hero from "../components/hero/Hero";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import ControlledAccordions, {
  type ItemType,
} from "../components/accordion/Accordion";

const FAQ_ITEMS: ItemType[] = [
  {
    id: "faq-1",
    title:
      "What is the duration and structure of the School of Disciples program?",
    text: "The School of Disciples is a comprehensive one-year discipleship course comprising 169 in-depth modules. It combines practical spiritual training, lectures from Pastor E.A. Adeboye, and hands-on ministry work available both in-person across our U.S. centers and virtually online.",
  },
  {
    id: "faq-2",
    title: "Who is eligible to enroll in the School of Disciples?",
    text: "The School of Disciples is open to all born-again Christians from all denominations who desire to deepen their walk with God, understand discipleship principles, and be equipped for kingdom leadership.",
  },
  {
    id: "faq-3",
    title: "How are the 169 modules delivered across centers?",
    text: "Modules are taught through structured weekend study sessions, video lectures by Pastor E.A. Adeboye, practical field activities, and interactive discussions led by certified instructors.",
  },
  {
    id: "faq-4",
    title:
      "Can I participate in virtual sessions if there is no physical center near me?",
    text: "Yes. RCCG The Americas-1 provides robust virtual learning options designed for students who cannot physically attend a local center due to geographical proximity.",
  },
  {
    id: "faq-5",
    title: "What are the graduation requirements and certification?",
    text: "Graduation requires completion of all modules, satisfactory attendance, passing assessments, and active participation in required practical outreach. Graduates receive an officially recognized certificate from CRM / RCCG.",
  },
];

const Home = () => {
  const [searchParams] = useSearchParams();
  const paid = searchParams.get("success");
  const navigate = useNavigate();

  useEffect(() => {
    if (paid === "true") {
      toast.success("Payment successful");
    } else if (paid === "false") {
      toast.error("Payment failed, contact website host");
    }
  }, [paid]);

  return (
    <div className="bg-surface-container-lowest text-charcoal">
      <Hero
        preTitle="Welcome to"
        title="RCCG The Americas-1 School of Disciples"
        subtitle="Our mission is to nurture and develop future leaders who are grounded in biblical truth, filled with the Holy Spirit, and committed to serving their communities with excellence and compassion."
      />

      <section className="bg-coolgray border-b border-bordergray py-12">
        <div className="max-w-4xl mx-auto px-space-lg lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 justify-items-center text-center">
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

      <section
        className="py-20 lg:py-24 bg-surface-container-lowest border-b border-bordergray"
        id="about"
      >
        <div className="max-w-custom mx-auto px-space-lg lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-5">
              <div className="relative w-full h-80 sm:h-96 lg:h-[420px] rounded-card overflow-hidden border border-bordergray shadow-ambient bg-coolgray">
                <img
                  src="/images/Pastor5.jpg"
                  alt="Pastor E.A. Adeboye preaching"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 z-10">
                  <p className="text-on-primary font-serif font-bold text-base sm:text-lg">
                    Pastor E.A. Adeboye
                  </p>
                  <p className="text-inverse-on-surface/85 text-sm">
                    Founder &amp; General Overseer, RCCG
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-center self-center">
              <div className="w-8 h-[2px] bg-gold mb-5" />
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-navy mb-6 leading-tight">
                Learn more about us
              </h2>
              <div className="space-y-4 text-charcoal text-base sm:text-[17px] leading-relaxed font-normal">
                <p>
                  The School of Disciples, founded in 1985 by Pastor E.A.
                  Adeboye, is an initiative by Christ the Redeemer’s Ministries
                  under the Redeemed Christian Church of God (RCCG). It aims to
                  train Christians from all denominations to become true
                  disciples of Jesus Christ, fulfilling the command from John
                  14:12 to perform works like Jesus and even greater.
                </p>
                <p>
                  The school focuses on practical training, including lectures
                  from Pastor Adeboye, to equip believers for effective
                  Christian living and service. It prepares them to become
                  dynamic disciples and end-time soldiers of Christ.
                </p>
                <p>
                  The School of Disciples RCCG Americas 1 has centers across the
                  U.S., offering both in-person and virtual meetings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-surface-container-lowest" id="register">
        <div className="max-w-custom mx-auto px-space-lg lg:px-8">
          <div className="grid grid-cols-1 gap-8">
            <MatricCard
              title="Registration"
              text="Register and pay online"
              icon={<GoTrophy />}
            />
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24 bg-coolgray border-t border-b border-bordergray">
        <div className="max-w-custom mx-auto px-space-lg lg:px-8">
          <article className="max-w-2xl mb-12 text-left">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-navy mb-3">
              School of Disciple itinerary
            </h1>
            <p className="text-slate text-base">
              Comprehensive structural pillars built to guide and support your
              spiritual development.
            </p>
          </article>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
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
        </div>
      </section>

      <ParallaxSection backgroundImage="https://images.unsplash.com/photo-1634951401794-6c84f593db82?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D">
        <div className="text-on-primary">
          <article>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-on-primary leading-tight mb-4">
              School of disciples Learning Community
            </h2>
            <p className="text-inverse-on-surface/85 text-base sm:text-[17px] leading-relaxed mb-8 max-w-lg">
              Join this community to understand more about the School of
              Disciples courses, how to enroll and our centres.
            </p>
          </article>
          <div>
            <button
              type="button"
              onClick={() => navigate("/team")}
              className="inline-flex items-center justify-center h-11 px-7 rounded-md border border-white text-on-primary font-medium text-sm tracking-wide uppercase hover:bg-surface-container-lowest hover:text-navy transition-colors focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
            >
              Read more
            </button>
          </div>
        </div>
      </ParallaxSection>

      <section className="py-20 lg:py-24 bg-coolgray" id="faq">
        <div className="max-w-custom mx-auto px-space-lg lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-navy mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-slate text-base">
                Find answers to common questions about enrollment, curriculum,
                and course format.
              </p>
            </div>
            <ControlledAccordions items={FAQ_ITEMS} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
