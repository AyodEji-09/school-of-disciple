import { Button } from "@mui/material";
import Hero from "../components/hero/Hero";
import TeamCard from "../components/team-card/TeamCard";
import team from "../team";

const Home = () => {
  return (
    <div>
      <Hero
        title="Welcome to School of Disciples"
        subtitle="Our mission is to nurture and develop future leaders who are grounded in biblical truth, filled with the Holy Spirit, and committed to serving their communities with excellence and compassion."
      />
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <img src="/src/assets/images/Pastor5.jpg" alt="" />
          <div className="space-y-2 self-center">
            <h2 className="text-2xl font-bold">ABOUT US</h2>
            <p className="text-sm md:text-lg">
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
      <section className="relative py-16">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/src/assets/images/bg_4.jpg.webp"
            className="w-full h-full object-cover object-center"
            alt=""
          />
        </div>
        <div className="absolute inset-0 overflow-hidden bg-black opacity-45"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-center gap-8 flex-wrap text-white">
            <p className="text-2xl font-bold text-center">
              Join Our School of Ministry, Create an account
            </p>
            <Button
              sx={{ backgroundColor: "green", color: "white", height: 40 }}
            >
              Register
            </Button>
          </div>
        </div>
      </section>
      <section className="py-16 container mx-auto px-4">
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
      </section>
    </div>
  );
};

export default Home;
