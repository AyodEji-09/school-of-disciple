import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TOKEN, useURL } from "../config";

export interface NotificationDoc {
  _id: string;
  recipient?: string;
  roleRecipient?: string;
  type: string;
  transactionId?: string;
  transactionType?: string;
  isRead: boolean;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  tagTypes: ["Notification", "NotificationList"],
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
    getNotifications: builder.query<ApiResponseN<NotificationDoc[]>, void>({
      query: () => "/notification",
      providesTags: (result) =>
        result?.data?.length
          ? [
              { type: "NotificationList", id: "LIST" },
              ...result.data.map((n) => ({
                type: "Notification" as const,
                id: n._id,
              })),
            ]
          : [{ type: "NotificationList", id: "LIST" }],
    }),
    markAsRead: builder.mutation<ApiResponseN<NotificationDoc>, string>({
      query: (id) => ({
        url: `/notification/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "Notification", id },
        { type: "NotificationList", id: "LIST" },
      ],
    }),
    markAllAsRead: builder.mutation<ApiResponseN<void>, void>({
      query: () => ({
        url: "/notification/read-all",
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "NotificationList", id: "LIST" }],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
