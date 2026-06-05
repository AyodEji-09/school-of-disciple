import type { JSX } from "react"

const Itinerary = ({title, text, icon}: {title: string, text: string, icon: JSX.Element}) => {
  return (
    <div className="bg-white p-8 text-center">
        <span className="text-6xl text-[#0054a6] flex justify-center">{icon}</span>
        <h4 className="font-medium text-[#333] text-xl uppercase">{title}</h4>
        <p className="text-[#555] text-sm">{text}</p>
    </div>
  )
}

export default Itinerary