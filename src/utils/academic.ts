/** Colour coding for result status chips */
export const STATUS_COLOR: Record<ResultStatus, "warning" | "primary" | "success" | "neutral"> = {
  draft: "warning",
  submitted: "primary",
  published: "success",
  locked: "neutral",
};

export const PUB_STATUS_COLOR: Record<PublicationStatus, "warning" | "success" | "danger"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export const gradeColor = (grade: string) => {
  if (["A", "A+", "A-"].includes(grade)) return "#16a34a";
  if (["B", "B+", "B-"].includes(grade)) return "#2563eb";
  if (["C", "C+", "C-"].includes(grade)) return "#d97706";
  if (["D", "D+", "D-"].includes(grade)) return "#ea580c";
  return "#dc2626";
};

export const resolveId = (val: { _id: string } | string | undefined) =>
  typeof val === "string" ? val : val?._id ?? "";

export const resolveName = (val: { name: string } | string | undefined) =>
  typeof val === "string" ? val : val?.name ?? "-";
