import { SlGraduation } from "react-icons/sl"
import Hero from "../components/hero/Hero"
import MatricCard from "../components/matrics/MatricCard"
import { GoTrophy } from "react-icons/go"
import { FiTarget } from "react-icons/fi"

const About = () => {
  return (
    <div>
      <Hero color="#392779cc" title="About School of Disciples" variant="sub" link="https://plus.unsplash.com/premium_photo-1677567996070-68fa4181775a?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
      <section className="p-8 space-y-4">
          <div className="w-32 mx-auto bg-gray-400">
            <div className="w-1/2 mx-auto py-[1px] bg-[#392779]"></div>
          </div>
        <article className="text-center">
          <h1 className="font-medium text-[#333] text-3xl md:text-4xl">About CRM School of Disciples</h1>
          <p className="text-xl font-light mt-4 leading-8">The School of Disciples was founded in 1985 by Pastor E.A. Adeboye, the General Overseer of RCCG Worldwide. It is coordinated by Christ the Redeemer’s Ministries, an evangelical arm of the Redeemed Christian Church of God. At this school, Christians of all denominations can learn to be true and genuine disciples of Jesus Christ and how to study to show themselves approved unto God.
          </p>
          </article>
      </section>
      <section className="bg-[#121921] p-8">
        <div className="max-w-2xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <MatricCard title="Session" text="10 years of extensive training" icon={<SlGraduation />} />
          <MatricCard title="Modules" text="169 modules to be explored" icon={<GoTrophy />} />
          <MatricCard title="Enrollment" text="Over 100,000 enrollments" icon={<FiTarget />} />
          </div>
        </div>
      </section>
    </div>
  )
}

export default About