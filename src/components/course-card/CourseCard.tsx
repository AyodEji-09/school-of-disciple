import { IoCopyOutline } from "react-icons/io5";

const CourseCard = ({lessons, title, img}:{lessons: number, title: string, img?: string}) => {
  return (
    <div className="relative h-[250px] flex flex-col justify-between w-full max-w-2xl mx-auto">
        <div className="absolute inset-0 overflow-hidden bg-gradient-to-t from-black to-transparent z-10"></div>
        <div className="absolute inset-0 overflow-hidden">
            <img src={img || "https://images.unsplash.com/photo-1612115958726-9af4b6bd28d1?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"} alt="" className="h-full w-full object-cover" />
        </div>
        <div></div>
        <div className="relative z-20 w-full text-left p-4 text-white">
            <p className="text-sm flex gap-2"><span><IoCopyOutline /></span>{lessons} Lessons</p>
            <h4 className="uppercase font-semibold text-xl">{title}</h4>
        </div>
    </div>
  )
}

export default CourseCard