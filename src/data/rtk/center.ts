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
            query: ({ limit = 20, search, page = 1 }) => {
                const params = new URLSearchParams();

                if (page != null) params.set("page", String(page));
                if (limit != null) params.set("limit", String(limit));

                if (search) {
                    params.set("search", search);
                    params.set("searchFields", "name,address");
                }

                return `/center?${params.toString()}`;
            },
        }),
        getAllCenter: builder.query<
            ApiResponse<Center>,
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
