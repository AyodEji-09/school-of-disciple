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
    <article className="bg-surface-container-lowest rounded-xl p-space-lg border border-mist/80 shadow-ambient flex flex-col justify-start transition-transform duration-200 hover:-translate-y-1 h-full">
      <div className="img w-full aspect-4/5 rounded-lg overflow-hidden bg-surface-container-high mb-space-lg relative">
        <img
          src={`/images/${img}`}
          className="h-full w-full object-cover object-top"
          alt={name}
          loading="lazy"
        />
      </div>
      <div className="content">
        <span className="font-label-sm text-label-sm uppercase tracking-[0.12em] text-outline font-medium block mb-1.5">
          {title}
        </span>
        <h3 className="font-headline-sm text-headline-sm text-primary font-semibold tracking-tight mb-3">
          {name}
        </h3>
        {description && (
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </article>
  );
};

export default TeamCard;
