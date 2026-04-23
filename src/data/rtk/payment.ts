import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TOKEN, useURL } from "../config";

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  tagTypes: ["Payment", "PaymentList", "UserPayments"],
  keepUnusedDataFor: 90,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  baseQuery: fetchBaseQuery({
    baseUrl: useURL,
    prepareHeaders: (header) => {
      header.set("authorization", "Bearer " + localStorage.getItem(TOKEN));
    },
  }),
  endpoints: (builder) => ({
    getPayments: builder.query<
      ApiResponse<Payment>,
      { limit?: number; search?: string; page?: number | null; center?: string }
    >({
      query: ({ limit = 20, search, center, page = 1 }) => {
        const params = new URLSearchParams();

        if (page != null) params.set("page", String(page));
        if (limit != null) params.set("limit", String(limit));
        if (center) params.set("center", center);

        if (search) {
          params.set("search", search);
          params.set("searchFields", "firstName,lastName");
        }

        return `/payment?${params.toString()}`;
      },
      providesTags: (result) =>
        result?.data?.docs?.length
          ? [
              { type: "PaymentList", id: "LIST" },
              ...result.data.docs.map((payment) => ({
                type: "Payment" as const,
                id: payment._id,
              })),
            ]
          : [{ type: "PaymentList", id: "LIST" }],
    }),
    getUserPayments: builder.query<
      ApiResponse<Payment>,
      { userId: string; limit?: number; page?: number | null }
    >({
      query: ({ userId, limit = 20, page = 1 }) =>
        `/payment/user/${userId}?page=${page}&limit=${limit}`,
      providesTags: (result, _, arg) =>
        result?.data?.docs?.length
          ? [
              { type: "UserPayments", id: arg.userId },
              ...result.data.docs.map((payment) => ({
                type: "Payment" as const,
                id: payment._id,
              })),
            ]
          : [{ type: "UserPayments", id: arg.userId }],
    }),
    getPayment: builder.query<{ message: string; data: Payment }, string>({
      query: (id) => `/payment/${id}`,
      providesTags: (_, __, id) => [{ type: "Payment", id }],
    }),
  }),
});

export const { useGetPaymentsQuery, useGetUserPaymentsQuery } = paymentApi;
