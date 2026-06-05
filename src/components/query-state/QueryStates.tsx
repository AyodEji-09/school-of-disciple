import { Card, Skeleton, Stack, Typography } from "@mui/joy";
import { PulseLoader } from "react-spinners";

export const PageLoader = ({ label }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-3 text-[#6B7280]">
    <PulseLoader size={10} color="#001EC5" />
    {label ? (
      <Typography level="body-sm" textColor="neutral.500">
        {label}
      </Typography>
    ) : null}
  </div>
);

export const SectionLoader = () => (
  <div className="flex justify-center py-12">
    <PulseLoader size={8} color="#001EC5" />
  </div>
);

export const MetricCardSkeleton = () => {
  return (
    <Card variant="outlined" className="space-y-3 p-4 min-h-[104px]">
      <Skeleton variant="text" width={72} height={34} />
      <Skeleton variant="text" width={140} height={20} />
    </Card>
  );
};

export const MetricCardRow = ({ count = 3 }: { count?: number }) => (
  <div className="grid sm:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, idx) => (
      <MetricCardSkeleton key={idx} />
    ))}
  </div>
);

export const TableSkeleton = ({
  columns = 4,
  rows = 5,
}: {
  columns?: number;
  rows?: number;
}) => {
  return (
    <div className="px-6 space-y-3 py-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-3 items-center"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((__, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="text"
              width={colIndex === 0 ? 160 : 110}
              height={22}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CenteredEmptyState = ({
  description = "No data found",
  icon,
}: {
  description?: string;
  icon?: React.ReactNode;
}) => {
  return (
    <Stack
      sx={{
        py: 12,
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
        color: "#94A3B8",
        gap: 1.5,
      }}
    >
      {icon ? <div className="text-2xl">{icon}</div> : null}
      <Typography textColor="neutral.500" level="body-md">
        {description}
      </Typography>
    </Stack>
  );
};

export const SectionSkeleton = ({
  titleWidth = 120,
  lineCount = 4,
}: {
  titleWidth?: number;
  lineCount?: number;
}) => {
  return (
    <Card variant="outlined" className="space-y-4 p-4">
      <Skeleton variant="text" width={titleWidth} height={24} />
      <div className="space-y-3">
        {Array.from({ length: lineCount }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <Skeleton variant="text" width={90} height={20} />
            <Skeleton variant="text" width={140} height={20} />
          </div>
        ))}
      </div>
    </Card>
  );
};
