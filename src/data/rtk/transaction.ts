import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TOKEN, useURL } from "../config";

export interface TransactionDoc {
  _id: string;
  type: "registration" | "remittance" | "manual_order";
  amount: number;
  method: "stripe" | "zelle";
  status: "pending" | "completed" | "rejected";
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    type: string;
  };
  center?: {
    _id: string;
    name: string;
  };
  description?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  zelleReceiptUrl?: string;
  confirmedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  confirmedAt?: string;
  rejectionReason?: string;
  metadata?: Record<string, any>;
  academicYear?: string;
  createdAt: string;
  updatedAt: string;
}

export const transactionApi = createApi({
  reducerPath: "transactionApi",
  tagTypes: ["Transaction", "TransactionList"],
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
    getTransactions: builder.query<
      ApiResponse<TransactionDoc>,
      {
        limit?: number;
        page?: number;
        status?: string;
        type?: string;
        method?: string;
        academicYear?: string;
        sessionId?: string;
      }
    >({
      query: ({ limit = 20, page = 1, status, type, method, academicYear, sessionId }) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (status) params.set("status", status);
        if (type) params.set("type", type);
        if (method) params.set("method", method);
        if (academicYear) params.set("academicYear", academicYear);
        if (sessionId) params.set("sessionId", sessionId);
        return `/transaction?${params.toString()}`;
      },
      providesTags: (result) =>
        result?.data?.docs?.length
          ? [
              { type: "TransactionList", id: "LIST" },
              ...result.data.docs.map((t) => ({
                type: "Transaction" as const,
                id: t._id,
              })),
            ]
          : [{ type: "TransactionList", id: "LIST" }],
    }),
    confirmTransaction: builder.mutation<ApiResponseN<TransactionDoc>, string>({
      query: (id) => ({
        url: `/transaction/${id}/confirm`,
        method: "PATCH",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "Transaction", id },
        { type: "TransactionList", id: "LIST" },
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          const { remittanceApi } = await import("./remittance");
          dispatch(remittanceApi.util.invalidateTags([{ type: "RemittanceList", id: "LIST" }]));
          
          const { manualOrderApi } = await import("./manual-order");
          dispatch(manualOrderApi.util.invalidateTags([{ type: "ManualOrderList", id: "LIST" }]));

          const { paymentApi } = await import("./payment");
          dispatch(paymentApi.util.invalidateTags([{ type: "PaymentList", id: "LIST" }]));

          const { userApi } = await import("./user");
          dispatch(userApi.util.invalidateTags([
            { type: "UserList", id: "LIST" },
            { type: "CurrentUser", id: "ME" }
          ]));
        } catch {
          // no-op
        }
      },
    }),
    rejectTransaction: builder.mutation<
      ApiResponseN<TransactionDoc>,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/transaction/${id}/reject`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Transaction", id },
        { type: "TransactionList", id: "LIST" },
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          const { remittanceApi } = await import("./remittance");
          dispatch(remittanceApi.util.invalidateTags([{ type: "RemittanceList", id: "LIST" }]));
          
          const { manualOrderApi } = await import("./manual-order");
          dispatch(manualOrderApi.util.invalidateTags([{ type: "ManualOrderList", id: "LIST" }]));

          const { paymentApi } = await import("./payment");
          dispatch(paymentApi.util.invalidateTags([{ type: "PaymentList", id: "LIST" }]));

          const { userApi } = await import("./user");
          dispatch(userApi.util.invalidateTags([
            { type: "UserList", id: "LIST" },
            { type: "CurrentUser", id: "ME" }
          ]));
        } catch {
          // no-op
        }
      },
    }),
    uploadTransactionReceipt: builder.mutation<
      ApiResponseN<TransactionDoc>,
      { id: string; file: File }
    >({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append("receipt", file);
        return {
          url: `/transaction/${id}/receipt`,
          method: "PATCH",
          body: formData,
        };
      },
      invalidatesTags: (_, __, { id }) => [
        { type: "Transaction", id },
        { type: "TransactionList", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useConfirmTransactionMutation,
  useRejectTransactionMutation,
  useUploadTransactionReceiptMutation,
} = transactionApi;
