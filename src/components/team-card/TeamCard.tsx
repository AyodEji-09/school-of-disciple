const TeamCard = ({
  title,
  description,
  img,
  name,
}: {
  name: string;
  title: string;
  description: string;
  img: string;
}) => {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-300">
      <div className="img h-[350px] overflow-hidden">
        <img
          src={`/images/${img}`}
          className="h-full w-full object-cover object-top"
          alt=""
        />
      </div>
      <div className="content space-y-4 p-4">
        <div>
          <h2 className="text-xl font-bold capitalize">{name}</h2>
          <h2 className="text-md font-bold capitalize">{title}</h2>
        </div>
        <p className="text-sm text-gray-800">{description}</p>
      </div>
    </div>
  );
};

export default TeamCard;
