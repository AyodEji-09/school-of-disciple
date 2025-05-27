import Hero from "../components/hero/Hero"
import TeamCard from "../components/team-card/TeamCard"
import team from "../team"

const Team = () => {
  return (
    <div>
       <Hero color="#392779cc" title="Our team" variant="sub" link="https://plus.unsplash.com/premium_photo-1677567996070-68fa4181775a?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
        <section className="py-16 container mx-auto px-4">
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
  )
}

export default Team