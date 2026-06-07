export type StatusVariant = "success" | "warning" | "danger" | "neutral" | "primary";

export type StatusEntry = {
  label: string;
  color: StatusVariant;
};

export const COORDINATOR_STATUS: Record<string, StatusEntry> = {
  assigned: { label: "Assigned", color: "success" },
  unassigned: { label: "Unassigned", color: "warning" },
  deactivated: { label: "Deactivated", color: "danger" },
  pending: { label: "Pending Invite", color: "neutral" },
};

export const WINDOW_STATUS: Record<string, StatusEntry> = {
  Open: { label: "Open", color: "success" },
  Upcoming: { label: "Upcoming", color: "warning" },
  Closed: { label: "Closed", color: "danger" },
  "Not Configured": { label: "Not Configured", color: "neutral" },
};

export const REMITTANCE_STATUS: Record<string, StatusEntry> = {
  paid: { label: "Confirmed", color: "success" },
  pending_confirmation: { label: "Pending", color: "warning" },
  rejected: { label: "Rejected", color: "danger" },
};

export const PAYMENT_STATUS: Record<string, StatusEntry> = {
  paid: { label: "Paid", color: "success" },
  pending: { label: "Pending", color: "warning" },
  failed: { label: "Failed", color: "danger" },
};

export const MANUAL_ORDER_STATUS: Record<string, StatusEntry> = {
  pending_payment: { label: "Pending Payment", color: "warning" },
  pending_confirmation: { label: "Pending Confirmation", color: "neutral" },
  paid: { label: "Paid", color: "success" },
  rejected: { label: "Rejected", color: "danger" },
  processing: { label: "Processing", color: "primary" },
  completed: { label: "Completed", color: "success" },
};

export const RESULT_STATUS: Record<string, StatusEntry> = {
  draft: { label: "Draft", color: "warning" },
  published: { label: "Published", color: "success" },
};

export const CENTER_RESULT_STATUS: Record<string, StatusEntry> = {
  not_uploaded: { label: "Not Uploaded", color: "neutral" },
  draft: { label: "Drafts Pending", color: "warning" },
  published: { label: "Published", color: "success" },
};

export const CORRECTION_STATUS: Record<string, StatusEntry> = {
  pending: { label: "Pending", color: "warning" },
  approved: { label: "Approved", color: "success" },
  rejected: { label: "Rejected", color: "danger" },
};

export const METHOD_STATUS: Record<string, StatusEntry> = {
  stripe: { label: "Stripe", color: "primary" },
  zelle: { label: "Zelle", color: "warning" },
};

export const TX_TYPE_STATUS: Record<string, StatusEntry> = {
  registration: { label: "Student Registration", color: "primary" },
  remittance: { label: "Coordinator Remittance", color: "warning" },
  manual_order: { label: "Manual Order", color: "success" },
};

export function resolveStatus(
  map: Record<string, StatusEntry>,
  value: string | undefined | null,
  fallback: StatusEntry = { label: "—", color: "neutral" },
): StatusEntry {
  if (!value) return fallback;
  return map[value] ?? { label: capitalize(value), color: "neutral" };
}

function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
