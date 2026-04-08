import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TOKEN, useURL } from "../config";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: useURL,
    prepareHeaders: (header) => {
      header.set("authorization", "Bearer " + localStorage.getItem(TOKEN));
    },
  }),
  endpoints: (builder) => ({
    getUsers: builder.query<
      ApiResponse<User>,
      { type: string; limit?: number; search?: string; page?: number | null, center?: string }
    >({
      query: ({ type, center, limit = 20, search, page = 1 }) => {
        const params = new URLSearchParams();
        params.set("type", type);

        if (center) params.set("center", center);
        if (page != null) params.set("page", String(page));
        if (limit != null) params.set("limit", String(limit));

        if (search) {
          params.set("search", search);
          params.set("searchFields", "firstName,lastName");
        }

        return `/user/all?${params.toString()}`;
      },
    }),
    getUser: builder.query<
      { message: string; data: User },
      string
    >({
      query: (id) => `/user/${id}`,
    }),
  })
})

export const {
  useGetUsersQuery,
  useGetUserQuery
} = userApi;
