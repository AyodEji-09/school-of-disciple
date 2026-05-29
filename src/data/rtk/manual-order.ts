import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TOKEN, useURL } from "../config";

export const manualOrderApi = createApi({
  reducerPath: "manualOrderApi",
  tagTypes: ["ManualOrder", "ManualOrderList"],
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
    getManualOrders: builder.query<
      ApiResponse<ManualOrder>,
      {
        limit?: number;
        page?: number;
        status?: string;
      }
    >({
      query: ({ limit = 10, page = 1, status }) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (status) params.set("status", status);
        return `/manual-order?${params.toString()}`;
      },
      providesTags: (result) =>
        result?.data?.docs?.length
          ? [
              { type: "ManualOrderList", id: "LIST" },
              ...result.data.docs.map((order) => ({
                type: "ManualOrder" as const,
                id: order._id,
              })),
            ]
          : [{ type: "ManualOrderList", id: "LIST" }],
    }),
    createStripeManualOrder: builder.mutation<
      ApiResponseN<{ url: string; order: ManualOrder }>,
      {
        centerName: string;
        zone: string;
        phone: string;
        zonalRegionalCoordinatorName: string;
        quantity: number;
        mailingAddress: string;
        concerns?: string;
      }
    >({
      query: (body) => ({
        url: "/manual-order/stripe",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ManualOrderList", id: "LIST" }],
    }),
    createZelleManualOrder: builder.mutation<
      ApiResponseN<{ order: ManualOrder }>,
      {
        centerName: string;
        zone: string;
        phone: string;
        zonalRegionalCoordinatorName: string;
        quantity: number;
        mailingAddress: string;
        concerns?: string;
      }
    >({
      query: (body) => ({
        url: "/manual-order/zelle",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ManualOrderList", id: "LIST" }],
    }),
    confirmManualOrder: builder.mutation<ApiResponseN<ManualOrder>, string>({
      query: (id) => ({
        url: `/manual-order/${id}/confirm`,
        method: "PATCH",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "ManualOrder", id },
        { type: "ManualOrderList", id: "LIST" },
      ],
    }),
    uploadManualOrderReceipt: builder.mutation<
      ApiResponseN<ManualOrder>,
      { id: string; file: File }
    >({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append("receipt", file);
        return {
          url: `/manual-order/${id}/receipt`,
          method: "PATCH",
          body: formData,
        };
      },
      invalidatesTags: (_, __, { id }) => [
        { type: "ManualOrder", id },
        { type: "ManualOrderList", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetManualOrdersQuery,
  useCreateStripeManualOrderMutation,
  useCreateZelleManualOrderMutation,
  useConfirmManualOrderMutation,
  useUploadManualOrderReceiptMutation,
} = manualOrderApi;
