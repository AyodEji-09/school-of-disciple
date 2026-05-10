import { Card, Skeleton, Typography } from "@mui/joy";

export const MetricCardSkeleton = () => {
  return (
    <Card variant="outlined" className="space-y-3 p-4 min-h-[104px]">
      <Skeleton variant="text" width={72} height={34} />
      <Skeleton variant="text" width={140} height={20} />
    </Card>
  );
};

export const TableSkeleton = ({
  columns = 4,
  rows = 5,
}: {
  columns?: number;
  rows?: number;
}) => {
  return (
    <div className="space-y-3 py-3">
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
}: {
  description?: string;
}) => {
  return (
    <div className="py-16 text-center flex flex-col items-center justify-center text-[#6B7280]">
      <Typography textColor="neutral.500" level="body-md">
        {description}
      </Typography>
    </div>
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
