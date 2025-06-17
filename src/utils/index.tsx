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

    return lastName + " " + firstName;
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
    }
  );
  console.log({ res });
  return res;
};
