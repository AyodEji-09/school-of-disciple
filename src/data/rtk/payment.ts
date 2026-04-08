import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TOKEN, useURL } from "../config";

export const paymentApi = createApi({
    reducerPath: "paymentApi",
    baseQuery: fetchBaseQuery({
        baseUrl: useURL,
        prepareHeaders: (header) => {
            header.set("authorization", "Bearer " + localStorage.getItem(TOKEN));
        },
    }),
    endpoints: (builder) => ({
        getPayments: builder.query<
            ApiResponse<Payment>,
            { limit?: number; search?: string; page?: number | null, center?: string }
        >({
            query: ({ limit = 20, search, center, page = 1 }) => {
                const params = new URLSearchParams();

                if (page != null) params.set("page", String(page));
                if (limit != null) params.set("limit", String(limit));
                if (center) params.set("studentId.center._id", center);

                if (search) {
                    params.set("search", search);
                    params.set("searchFields", "firstName,lastName");
                }

                return `/payment?${params.toString()}`;
            },
        }),
        getUserPayments: builder.query<
            ApiResponse<Payment>,
            { userId: string; limit?: number; page?: number | null }
        >({
            query: ({ userId, limit = 20, page = 1 }) =>
                `/payment/user/${userId}?page=${page}&limit=${limit}`,
        }),
        getPayment: builder.query<
            { message: string; data: Payment },
            string
        >({
            query: (id) => `/payment/${id}`,
        }),
    })
})

export const {
    useGetPaymentsQuery,
    useGetUserPaymentsQuery
} = paymentApi;
