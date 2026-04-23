import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TOKEN, useURL } from "../config";

export const userApi = createApi({
  reducerPath: "userApi",
  tagTypes: ["User", "UserList", "CurrentUser"],
  keepUnusedDataFor: 120,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  baseQuery: fetchBaseQuery({
    baseUrl: useURL,
    prepareHeaders: (header) => {
      header.set("authorization", "Bearer " + localStorage.getItem(TOKEN));
    },
  }),
  endpoints: (builder) => ({
    getUsers: builder.query<
      ApiResponse<User>,
      {
        type: string;
        limit?: number;
        search?: string;
        page?: number | null;
        center?: string;
      }
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
      providesTags: (result) =>
        result?.data?.docs?.length
          ? [
              { type: "UserList", id: "LIST" },
              ...result.data.docs.map((user) => ({
                type: "User" as const,
                id: user._id,
              })),
            ]
          : [{ type: "UserList", id: "LIST" }],
    }),
    getUser: builder.query<{ message: string; data: User }, string>({
      query: (id) => `/user/${id}`,
      providesTags: (_, __, id) => [{ type: "User", id }],
    }),
    getCurrentUser: builder.query<ApiResponseN<User>, void>({
      query: () => "/user",
      providesTags: (result) =>
        result?.data?._id
          ? [
              { type: "CurrentUser", id: "ME" },
              { type: "User", id: result.data._id },
            ]
          : [{ type: "CurrentUser", id: "ME" }],
    }),
    updateUser: builder.mutation<
      ApiResponseN<User>,
      {
        id: string;
        body: {
          firstName?: string;
          lastName?: string;
          phone?: string;
          address?: string;
          state?: string;
          birthday?: string;
        };
      }
    >({
      query: ({ id, body }) => ({
        url: `/user/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "User", id: arg.id },
        { type: "UserList", id: "LIST" },
        { type: "CurrentUser", id: "ME" },
      ],
    }),
    uploadProfileImage: builder.mutation<
      ApiResponseN<{ avatar: avatarObject }>,
      File
    >({
      query: (file) => {
        const form = new FormData();
        form.append("image", file);

        return {
          url: "/user/upload",
          method: "POST",
          body: form,
        };
      },
      invalidatesTags: [
        { type: "CurrentUser", id: "ME" },
        { type: "UserList", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useUpdateUserMutation,
  useUploadProfileImageMutation,
} = userApi;
