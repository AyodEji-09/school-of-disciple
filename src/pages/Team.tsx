import Hero from "../components/hero/Hero";
import TeamCard from "../components/team-card/TeamCard";
import team from "../team";

const Team = () => {
  return (
    <div className="flex flex-col w-full bg-surface text-on-surface">
      <Hero
        color="#392779cc"
        preTitle="Leadership & Governance"
        title="Our Team"
        subtitle="Meet the dedicated spiritual leaders, coordinators, and instructors serving across RCCG The Americas-1 School of Disciples, committed to biblical rigor and ministerial excellence."
        variant="sub"
        link="https://plus.unsplash.com/premium_photo-1677567996070-68fa4181775a?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      />

      <section className="w-full bg-surface-container-lowest py-20 lg:py-24">
        <div className="max-w-custom mx-auto px-space-lg lg:px-8">
          <div className="mb-8 lg:mb-10">
            <span className="font-label-sm text-label-sm uppercase tracking-[0.14em] text-outline font-medium block mb-2">
              Faculty &amp; Directors
            </span>
            <h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-primary font-semibold">
              Presiding Council &amp; Academic Senate
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {team.map((member) => (
              <TeamCard
                key={member.id}
                name={member.name}
                title={member.title}
                description={member.desc}
                img={member.img}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Team;