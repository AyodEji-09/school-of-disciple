import { Box, Divider, Stack, Typography } from "@mui/joy";
import type { PropsWithChildren, ReactNode } from "react";

type PageCardProps = PropsWithChildren<{
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  divided?: boolean;
  padded?: boolean;
}>;

const PageCard = ({
  title,
  subtitle,
  action,
  className,
  bodyClassName,
  divided = true,
  padded = true,
  children,
}: PageCardProps) => {
  const hasHeader = title || subtitle || action;

  return (
    <Box
      className={[
        "bg-white border border-[#E6ECFF] rounded-2xl shadow-sm overflow-hidden",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {hasHeader ? (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          sx={{ px: 3, py: 2.5 }}
        >
          <Box>
            {title ? (
              <Typography level="title-md" sx={{ color: "#001F54" }}>
                {title}
              </Typography>
            ) : null}
            {subtitle ? (
              <Typography
                level="body-sm"
                sx={{ mt: 0.25, color: "#6B7280" }}
              >
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {action ? <Box>{action}</Box> : null}
        </Stack>
      ) : null}
      {hasHeader && divided ? <Divider /> : null}
      <Box className={padded ? "p-6" : bodyClassName ?? ""}>
        {children}
      </Box>
    </Box>
  );
};

export default PageCard;
