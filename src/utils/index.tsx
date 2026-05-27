import axios from "axios";

export const handleError = (error: unknown): string => {
  const err = error as ApiError;
  if (err.response) {
    return err.response.data.message;
  } else {
    return err.message;
  }
};

export const titleCaseName = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const [first = "", ...rest] = word;
      return `${first.toUpperCase()}${rest.join("").toLowerCase()}`;
    })
    .join(" ");

export const getUserFullName = (user?: User) => {
  if (user) {
    const firstName = titleCaseName(user.firstName || "");
    const lastName = titleCaseName(user.lastName || "");
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    if (fullName) return fullName;
    return "";
  }
  return "";
};

export const uploadAvatar = async (photo: File) => {
  const res = await axios.post(
    "/file",
    { mic: photo, type: "image" },
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  console.log({ res });
  return res;
};

export function capitalizeWords(str: string): string {
  if (!str) return "";

  return titleCaseName(str);
}

export const formatCenterAddress = (center?: Center | null): string => {
  if (!center) return "N/A";

  const parts = [
    center.address,
    center.landmark,
    center.city,
    center.state,
    center.postalCode,
    center.country,
  ]
    .map((part) => (part || "").trim())
    .filter(Boolean);

  return parts.length ? parts.join(", ") : "N/A";
};
