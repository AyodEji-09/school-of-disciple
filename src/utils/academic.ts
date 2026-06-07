/** Colour coding for result status chips */
export const STATUS_COLOR: Record<ResultStatus, "warning" | "success"> = {
  draft: "warning",
  published: "success",
};

export const CORRECTION_STATUS_COLOR: Record<
  CorrectionStatus,
  "warning" | "success" | "danger"
> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export const resolveId = (val: { _id: string } | string | undefined) =>
  typeof val === "string" ? val : val?._id ?? "";

export const resolveName = (val: { name: string } | string | undefined) =>
  typeof val === "string" ? val : val?.name ?? "-";
