import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TOKEN, useURL } from "../config";

export const remittanceApi = createApi({
  reducerPath: "remittanceApi",
  tagTypes: ["Remittance", "RemittanceList"],
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
    getRemittances: builder.query<
      ApiResponse<Remittance>,
      { limit?: number; page?: number; status?: string }
    >({
      query: ({ limit = 20, page = 1, status }) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (status) params.set("status", status);
        return `/remittance?${params.toString()}`;
      },
      providesTags: (result) =>
        result?.data?.docs?.length
          ? [
              { type: "RemittanceList", id: "LIST" },
              ...result.data.docs.map((r) => ({
                type: "Remittance" as const,
                id: r._id,
              })),
            ]
          : [{ type: "RemittanceList", id: "LIST" }],
    }),
    createStripeRemittance: builder.mutation<
      ApiResponseN<{ url: string }>,
      { amount: number; description?: string }
    >({
      query: (body) => ({
        url: "/remittance/stripe",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "RemittanceList", id: "LIST" }],
    }),
    createZelleRemittance: builder.mutation<
      ApiResponseN<{
        remittance: Remittance;
        zelleDetails: { email: string; name: string };
      }>,
      { amount: number; description?: string }
    >({
      query: (body) => ({
        url: "/remittance/zelle",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "RemittanceList", id: "LIST" }],
    }),
    getZelleDetails: builder.query<
      ApiResponseN<{ email: string; name: string }>,
      void
    >({
      query: () => "/remittance/zelle-details",
    }),
    confirmRemittance: builder.mutation<
      ApiResponseN<Remittance>,
      string
    >({
      query: (id) => ({
        url: `/remittance/${id}/confirm`,
        method: "PATCH",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "Remittance", id },
        { type: "RemittanceList", id: "LIST" },
      ],
    }),
    rejectRemittance: builder.mutation<
      ApiResponseN<Remittance>,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/remittance/${id}/reject`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Remittance", id },
        { type: "RemittanceList", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetRemittancesQuery,
  useCreateStripeRemittanceMutation,
  useCreateZelleRemittanceMutation,
  useGetZelleDetailsQuery,
  useConfirmRemittanceMutation,
  useRejectRemittanceMutation,
} = remittanceApi;
