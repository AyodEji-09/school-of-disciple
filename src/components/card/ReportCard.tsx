import { Typography } from "@mui/joy";

const ReportCard = ({
  title = "Facility Manager",
  number,
}: {
  title?: string;
  number?: string | number;
}) => {
  return (
    <div className="bg-white border border-[#E6ECFF] rounded-2xl p-5 space-y-1.5">
      <Typography
        level="h3"
        sx={{ color: "#001F54", fontWeight: 800, lineHeight: 1 }}
      >
        {number ?? ""}
      </Typography>
      <Typography level="body-sm" sx={{ color: "#6B7280" }}>
        {title}
      </Typography>
    </div>
  );
};

export default ReportCard;
