import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TOKEN, useURL } from "../config";

export const centerApi = createApi({
    reducerPath: "centerApi",
    baseQuery: fetchBaseQuery({
        baseUrl: useURL,
        prepareHeaders: (header) => {
            header.set("authorization", "Bearer " + localStorage.getItem(TOKEN));
        },
    }),
    endpoints: (builder) => ({
        getCenters: builder.query<
            ApiResponse<Center>,
            { limit?: number; search?: string; page?: number | null }
        >({
            query: ({ limit, search, page }) =>
                `/center?page=${page}&limit=${limit}${search
                    ? `&search=${search}&searchFields=name,address` : ''}`,
        }),
        getAllCenter: builder.query<
            ApiResponseN<Center[]>,
            void
        >({
            query: () => `/center`,
        }),
        getCenter: builder.query<
            ApiResponseN<Center>,
            string
        >({
            query: (id) => `/center/${id}`,
        }),
    })
})

export const {
    useGetCentersQuery,
    useGetCenterQuery,
    useGetAllCenterQuery
} = centerApi;
