import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TOKEN, useURL } from "../config";

export type AppointmentStatus =
  | "pending"
  | "approved"
  | "rescheduled"
  | "cancelled";

export interface AppointmentHistoryItem {
  action: "created" | "approved" | "cancelled" | "rescheduled";
  actorId: string;
  actorRole: "admin" | "coordinator" | "super";
  previousDate?: string | null;
  newDate?: string | null;
  reason?: string | null;
  timestamp: string;
}

export interface ExamAppointment {
  _id: string;
  coordinatorId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  centerId: {
    _id: string;
    name: string;
    code?: string;
    location?: string;
  };
  sessionId: {
    _id: string;
    name: string;
    isCurrent?: boolean;
  };
  yearId: {
    _id: string;
    name: string;
    number?: number;
  };
  description: string;
  scheduledDate: string;
  previousDate?: string | null;
  status: AppointmentStatus;
  cancellationReason?: string | null;
  rescheduleReason?: string | null;
  rescheduledBy?: "admin" | "coordinator" | null;
  history?: AppointmentHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentSummary {
  total: number;
  pending: number;
  approved: number;
  rescheduled: number;
  cancelled: number;
}

export const appointmentApi = createApi({
  reducerPath: "appointmentApi",
  tagTypes: ["Appointment", "AppointmentList", "AppointmentSummary"],
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
    getAppointments: builder.query<
      ApiResponse<ExamAppointment>,
      {
        page?: number;
        limit?: number;
        status?: string;
        sessionId?: string;
        yearId?: string;
        centerId?: string;
        search?: string;
      }
    >({
      query: ({
        page = 1,
        limit = 15,
        status,
        sessionId,
        yearId,
        centerId,
        search,
      }) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (status) params.set("status", status);
        if (sessionId) params.set("sessionId", sessionId);
        if (yearId) params.set("yearId", yearId);
        if (centerId) params.set("centerId", centerId);
        if (search) {
          params.set("search", search);
          params.set("searchFields", "description");
        }
        return `/appointment?${params.toString()}`;
      },
      providesTags: (result) =>
        result?.data?.docs?.length
          ? [
              { type: "AppointmentList", id: "LIST" },
              ...result.data.docs.map((item) => ({
                type: "Appointment" as const,
                id: item._id,
              })),
            ]
          : [{ type: "AppointmentList", id: "LIST" }],
    }),

    getAppointmentsSummary: builder.query<
      ApiResponseN<AppointmentSummary>,
      { sessionId?: string; yearId?: string; centerId?: string } | void
    >({
      query: (arg) => {
        const params = new URLSearchParams();
        if (arg?.sessionId) params.set("sessionId", arg.sessionId);
        if (arg?.yearId) params.set("yearId", arg.yearId);
        if (arg?.centerId) params.set("centerId", arg.centerId);
        const qs = params.toString();
        return `/appointment/summary${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["AppointmentSummary"],
    }),

    createAppointment: builder.mutation<
      ApiResponseN<ExamAppointment>,
      {
        sessionId?: string;
        yearId: string;
        description: string;
        scheduledDate: string;
      }
    >({
      query: (body) => ({
        url: "/appointment",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "AppointmentList", id: "LIST" },
        "AppointmentSummary",
      ],
    }),

    approveAppointment: builder.mutation<
      ApiResponseN<ExamAppointment>,
      string
    >({
      query: (id) => ({
        url: `/appointment/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Appointment", id },
        { type: "AppointmentList", id: "LIST" },
        "AppointmentSummary",
      ],
    }),

    cancelAppointment: builder.mutation<
      ApiResponseN<ExamAppointment>,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/appointment/${id}/cancel`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Appointment", id },
        { type: "AppointmentList", id: "LIST" },
        "AppointmentSummary",
      ],
    }),

    rescheduleAppointment: builder.mutation<
      ApiResponseN<ExamAppointment>,
      { id: string; scheduledDate: string; reason?: string }
    >({
      query: ({ id, scheduledDate, reason }) => ({
        url: `/appointment/${id}/reschedule`,
        method: "PATCH",
        body: { scheduledDate, reason },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Appointment", id },
        { type: "AppointmentList", id: "LIST" },
        "AppointmentSummary",
      ],
    }),
  }),
});

export const {
  useGetAppointmentsQuery,
  useGetAppointmentsSummaryQuery,
  useCreateAppointmentMutation,
  useApproveAppointmentMutation,
  useCancelAppointmentMutation,
  useRescheduleAppointmentMutation,
} = appointmentApi;
