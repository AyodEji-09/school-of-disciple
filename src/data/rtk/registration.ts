import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TOKEN, useURL } from "../config";

export const registrationApi = createApi({
  reducerPath: "registrationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: useURL,
    prepareHeaders: (header) => {
      header.set("authorization", "Bearer " + localStorage.getItem(TOKEN));
    },
  }),
  tagTypes: ["RegistrationWindow"],
  endpoints: (builder) => ({
    getRegistrationWindow: builder.query<ApiResponseN<RegistrationWindow>, void>({
      query: () => "/registration/window",
      providesTags: ["RegistrationWindow"],
    }),
    getAllRegistrationWindows: builder.query<
      ApiResponse<RegistrationWindow>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) =>
        `/registration/window/all?page=${page}&limit=${limit}`,
      providesTags: ["RegistrationWindow"],
    }),
    setRegistrationWindow: builder.mutation<
      ApiResponseN<RegistrationWindow>,
      { startDate: string; endDate: string; sessionId: string }
    >({
      query: (body) => ({
        url: "/registration/window",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RegistrationWindow"],
    }),
    updateRegistrationWindow: builder.mutation<
      ApiResponseN<RegistrationWindow>,
      { id: string; startDate: string; endDate: string; sessionId: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/registration/window/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["RegistrationWindow"],
    }),
  }),
});

export const {
  useGetRegistrationWindowQuery,
  useGetAllRegistrationWindowsQuery,
  useSetRegistrationWindowMutation,
  useUpdateRegistrationWindowMutation,
} = registrationApi;
