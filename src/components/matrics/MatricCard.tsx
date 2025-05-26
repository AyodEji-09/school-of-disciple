import type { JSX } from "react"

const MatricCard = ({title, text, icon}:{title: string, text: string, icon: JSX.Element}) => {
  return (
    <div className="flex flex-col items-center gap-1 text-center min-w-[150px]">
        <span className="text-white text-2xl">{icon}</span>
        <p className="text-[#FFC107] text-lg font-semibold">{title}</p>
        <p className="text-white text-sm">{text}</p>
    </div>
  )
}

export default MatricCard