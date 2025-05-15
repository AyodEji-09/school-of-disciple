export const handleError = (error: unknown): string => {
  const err = error as ApiError;
  if (err.response) {
    return err.response.data.message;
  } else {
    return err.message;
  }
};
