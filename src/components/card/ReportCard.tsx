import { Typography } from "@mui/joy";

const ReportCard = ({
  title = "Facility Manager",
  number,
}: {
  title?: string;
  number?: string | number;
}) => {
  return (
    <div className="bg-white max-w-md p-4 rounded-md space-y-2">
      {/* <Ellipse /> */}
      <Typography level="h3">{number ?? ""}</Typography>
      <Typography level="body-md" textColor={"#000000"}>
        {title}
      </Typography>
    </div>
  );
};

export default ReportCard;
