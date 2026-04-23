import axios from "axios";

export const handleError = (error: unknown): string => {
  const err = error as ApiError;
  if (err.response) {
    return err.response.data.message;
  } else {
    return err.message;
  }
};

export const getUserFullName = (user?: User) => {
  if (user) {
    const firstName = user.firstName;
    const lastName = user.lastName;

    return firstName + " " + lastName;
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

  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
