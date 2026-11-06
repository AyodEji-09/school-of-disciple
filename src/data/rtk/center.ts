import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TOKEN, useURL } from "../config";
import { userApi } from "./user";

const sortCenterDocs = (response: ApiResponse<Center>): ApiResponse<Center> => {
  if (!response?.data?.docs) return response;
  return {
    ...response,
    data: {
      ...response.data,
      docs: [...response.data.docs].sort((a, b) =>
        (a?.name || "").localeCompare(b?.name || "", undefined, {
          sensitivity: "base",
        }),
      ),
    },
  };
};

export const centerApi = createApi({
  reducerPath: "centerApi",
  tagTypes: ["Center", "CenterList"],
  keepUnusedDataFor: 180,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  baseQuery: fetchBaseQuery({
    baseUrl: useURL,
    prepareHeaders: (header) => {
      header.set("authorization", "Bearer " + localStorage.getItem(TOKEN));
    },
  }),
  endpoints: (builder) => ({
    getCenters: builder.query<
      ApiResponse<Center>,
      { limit?: number; search?: string; page?: number | null; managerStatus?: string }
    >({
      query: ({ limit = 20, search, page = 1, managerStatus }) => {
        const params = new URLSearchParams();

        if (page != null) params.set("page", String(page));
        if (limit != null) params.set("limit", String(limit));
        params.set("sortBy", "name");
        params.set("order", "asc");

        if (search) {
          params.set("search", search);
          params.set(
            "searchFields",
            "name,shortCode,region,province,zone,zoneShortCode,address,city,state,postalCode,country",
          );
        }

        if (managerStatus) params.set("managerStatus", managerStatus);

        return `/center?${params.toString()}`;
      },
      transformResponse: sortCenterDocs,
      providesTags: (result) =>
        result?.data?.docs?.length
          ? [
              { type: "CenterList", id: "LIST" },
              ...result.data.docs.map((center) => ({
                type: "Center" as const,
                id: center._id,
              })),
            ]
          : [{ type: "CenterList", id: "LIST" }],
    }),
    getAllCenter: builder.query<ApiResponse<Center>, void>({
      query: () => `/center?sortBy=name&order=asc`,
      transformResponse: sortCenterDocs,
      providesTags: (result) =>
        result?.data?.docs?.length
          ? [
              { type: "CenterList", id: "LIST" },
              ...result.data.docs.map((center) => ({
                type: "Center" as const,
                id: center._id,
              })),
            ]
          : [{ type: "CenterList", id: "LIST" }],
    }),
    getCenter: builder.query<ApiResponseN<Center>, string>({
      query: (id) => `/center/${id}`,
      providesTags: (_, __, id) => [{ type: "Center", id }],
    }),
    createCenter: builder.mutation<
      ApiResponseN<Center>,
      {
        name: string;
        shortCode: string;
        region: string;
        province: string;
        zone: string;
        zoneShortCode: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
      }
    >({
      query: (body) => ({
        url: "/center",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "CenterList", id: "LIST" }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            userApi.util.invalidateTags([{ type: "UserList", id: "LIST" }]),
          );
        } catch {
          // no-op
        }
      },
    }),
    updateCenter: builder.mutation<
      ApiResponseN<Center>,
      {
        id: string;
        name: string;
        shortCode: string;
        region: string;
        province: string;
        zone: string;
        zoneShortCode: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/center/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "Center", id: arg.id },
        { type: "CenterList", id: "LIST" },
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            userApi.util.invalidateTags([{ type: "UserList", id: "LIST" }]),
          );
        } catch {
          // no-op
        }
      },
    }),
    deleteCenter: builder.mutation<ApiResponseN<null>, string>({
      query: (id) => ({
        url: `/center/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "CenterList", id: "LIST" }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            userApi.util.invalidateTags([{ type: "UserList", id: "LIST" }]),
          );
        } catch {
          // no-op
        }
      },
    }),
  }),
});

export const {
  useGetCentersQuery,
  useGetCenterQuery,
  useGetAllCenterQuery,
  useCreateCenterMutation,
  useUpdateCenterMutation,
  useDeleteCenterMutation,
} = centerApi;
