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
            query: ({ limit = 20, search, center, page = 1 }) =>
                `/payment?page=${page}&limit=${limit}${center ? `&studentId.center._id=${center}` : ""}${search
                    ? `&search=${search}&searchFields=firstName,lastName` : ''}`,
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
