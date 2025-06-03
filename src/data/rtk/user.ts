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
      { type: string; limit?: number; search?: string; page?: number | null, tribe?: string, tent?: string }
    >({
      query: ({ type, tribe, tent, limit = 20, search, page = 1 }) =>
        `/user/all?type=${type}&page=${page}&limit=${limit}&tent=${tent}&tribe=${tribe}${search
          ? `&search=${search}&searchFields=firstName,lastName` : ''}`,
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
