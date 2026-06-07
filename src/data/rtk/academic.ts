import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TOKEN, useURL } from "../config";

// ── Types ─────────────────────────────────────────────────────────────────────
// Mirrors the API contract in docs/api-contracts.md.
//
// Endpoints split into two response shapes:
//   • Collection GETs (sessions, years, results, corrections) and
//     single-resource GETs return raw arrays/objects — NO `{ data }` wrapper.
//   • Analytics GETs and most mutations return `{ message, data?: ... }`.
//
// Year scores have no grade/remark fields — only `yearId` and `score`.
// Correction resolution uses body `{ status, rejectionReason? }` and the
// correction doc has `resolvedBy`/`resolvedAt`/`rejectionReason` (NOT
// `reviewedBy`/`reviewedAt`/`resolutionNote`).

export type ResultStatus = "draft" | "published";
export type CorrectionStatus = "pending" | "approved" | "rejected";

export interface AcademicSession {
  _id: string;
  name: string;
  startYear: number;
  endYear: number;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicYear {
  _id: string;
  name: string;
  number: number;
  sessionId: { _id: string; name: string } | string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface YearScore {
  yearId: { _id: string; name: string; number: number } | string;
  score: number;
}

export interface StudentResult {
  _id: string;
  studentId: { _id: string; firstName: string; lastName: string; matricNumber: string } | string;
  centerId: { _id: string; name: string } | string;
  sessionId: { _id: string; name: string } | string;
  yearScores: YearScore[];
  totalScore: number;
  average: number;
  status: ResultStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ScoreCorrection {
  _id: string;
  resultId: StudentResult | string;
  yearId: { _id: string; name: string; number: number } | string;
  studentId: { _id: string; firstName: string; lastName: string; matricNumber: string } | string;
  currentScore: number;
  requestedScore: number;
  reason: string;
  status: CorrectionStatus;
  resolvedBy?: { _id: string; firstName: string; lastName: string } | string | null;
  resolvedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface BulkUploadResult {
  total: number;
  processed: number;
  errors: number;
  details: {
    results: { row: number; studentId: string; action: string }[];
    errors: { row: number; studentId?: string; error: string }[];
  };
}

export interface YearPerformanceSummary {
  yearId: string;
  yearName: string;
  yearNumber: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  totalStudents: number;
}

export interface CenterPerformanceSummary {
  centerId: string;
  centerName: string;
  totalStudents: number;
  averageScore: number;
  passRate: number;
}

export interface StudentPerformanceData {
  sessions: {
    sessionName: string;
    yearName: string;
    average: number;
    totalScore: number;
    status: string;
  }[];
  overallAverage: number;
}

interface WrappedResponse<T> {
  message: string;
  data: T;
}

interface MessageOnlyResponse {
  message: string;
}

// ── Defensive unwraps ────────────────────────────────────────────────────────
// The spec says collection endpoints return raw arrays, but the deployed
// backend may still return `{ data: [...] }`. These helpers accept either
// shape so the frontend works against both — when the backend is fully
// migrated, the `as T[]` branch will be the one that hits.

const unwrapList = <T,>(raw: unknown): T[] => {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data)) {
    return ((raw as { data: T[] }).data) ?? [];
  }
  return [];
};

const unwrapOne = <T,>(raw: unknown): T | undefined => {
  if (raw && typeof raw === "object" && "data" in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
};

// ── API ───────────────────────────────────────────────────────────────────────

export const academicApi = createApi({
  reducerPath: "academicApi",
  tagTypes: [
    "Result",
    "ResultList",
    "Session",
    "SessionList",
    "Year",
    "YearList",
    "Correction",
    "CorrectionList",
  ],
  keepUnusedDataFor: 120,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  baseQuery: fetchBaseQuery({
    baseUrl: useURL,
    prepareHeaders: (headers) => {
      headers.set("authorization", "Bearer " + localStorage.getItem(TOKEN));
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // ── Results ──────────────────────────────────────────────────────────────
    // Collection endpoints return raw arrays.
    getResults: builder.query<
      StudentResult[],
      {
        studentId?: string;
        sessionId?: string;
        centerId?: string;
        status?: ResultStatus;
        yearId?: string;
      }
    >({
      query: (params = {}) => {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => v && q.set(k, v));
        return `/academic/results?${q}`;
      },
      transformResponse: (res: unknown) => unwrapList<StudentResult>(res),
      providesTags: ["ResultList"],
    }),
    getMyResults: builder.query<StudentResult[], void>({
      query: () => "/academic/results/my",
      transformResponse: (res: unknown) => unwrapList<StudentResult>(res),
      providesTags: ["ResultList"],
    }),
    getResultById: builder.query<StudentResult, string>({
      query: (id) => `/academic/results/${id}`,
      transformResponse: (res: unknown) => unwrapOne<StudentResult>(res),
      providesTags: (_, __, id) => [{ type: "Result", id }],
    }),
    createResult: builder.mutation<
      StudentResult,
      {
        studentId: string;
        sessionId: string;
        yearScores: { yearId: string; score: number }[];
      }
    >({
      query: (body) => ({ url: "/academic/results", method: "POST", body }),
      transformResponse: (res: unknown) => unwrapOne<StudentResult>(res),
      invalidatesTags: ["ResultList"],
    }),
    updateResult: builder.mutation<
      StudentResult,
      { id: string; yearScores: { yearId: string; score: number }[] }
    >({
      query: ({ id, ...body }) => ({
        url: `/academic/results/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res: unknown) => unwrapOne<StudentResult>(res),
      invalidatesTags: (_, __, arg) => [
        "ResultList",
        { type: "Result", id: arg.id },
      ],
    }),
    bulkUploadResults: builder.mutation<
      WrappedResponse<BulkUploadResult>,
      FormData
    >({
      query: (formData) => ({
        url: "/academic/results/bulk-upload",
        method: "POST",
        body: formData,
      }),
      transformResponse: (res: unknown) => {
        if (
          res &&
          typeof res === "object" &&
          "data" in (res as object) &&
          (res as { data: unknown }).data
        ) {
          return res as WrappedResponse<BulkUploadResult>;
        }
        return { message: "", data: res as BulkUploadResult };
      },
      invalidatesTags: ["ResultList"],
    }),
    publishSessionResults: builder.mutation<
      MessageOnlyResponse,
      { sessionId: string }
    >({
      query: (body) => ({
        url: "/academic/results/publish",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ResultList", "SessionList"],
    }),

    // ── Sessions & Years ─────────────────────────────────────────────────────
    getSessions: builder.query<AcademicSession[], void>({
      query: () => "/academic/sessions",
      transformResponse: (res: unknown) => unwrapList<AcademicSession>(res),
      providesTags: ["SessionList"],
    }),
    getYears: builder.query<
      AcademicYear[],
      { sessionId?: string } | void
    >({
      query: (params) => {
        if (params?.sessionId)
          return `/academic/sessions/years?sessionId=${params.sessionId}`;
        return "/academic/sessions/years";
      },
      transformResponse: (res: unknown) => unwrapList<AcademicYear>(res),
      providesTags: ["YearList"],
    }),

    // ── Analytics ─────────────────────────────────────────────────────────────
    // Analytics endpoints return `{ message, data }`.
    getStudentPerformance: builder.query<
      WrappedResponse<StudentPerformanceData>,
      string
    >({
      query: (studentId) => `/academic/analytics/student/${studentId}`,
    }),
    getYearAnalytics: builder.query<
      WrappedResponse<YearPerformanceSummary[]>,
      { sessionId: string; centerId?: string }
    >({
      query: (params) => {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => v && q.set(k, v));
        return `/academic/analytics/years?${q}`;
      },
    }),
    getSystemAnalytics: builder.query<
      WrappedResponse<CenterPerformanceSummary[]>,
      { sessionId: string; centerId?: string }
    >({
      query: (params) => {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => v && q.set(k, v));
        return `/academic/analytics/system?${q}`;
      },
    }),

    // ── Reports ───────────────────────────────────────────────────────────────
    // Center and global report endpoints return PDFs. The Reports pages fetch
    // them as blobs via axios and trigger a download — RTK Query is not used
    // here because the response is binary, not JSON.

    // ── Session mutations ─────────────────────────────────────────────────────
    createSession: builder.mutation<
      AcademicSession,
      { name: string; startYear: number; endYear: number; isCurrent?: boolean }
    >({
      query: (body) => ({ url: "/academic/sessions", method: "POST", body }),
      transformResponse: (res: unknown) => unwrapOne<AcademicSession>(res),
      invalidatesTags: ["SessionList", "YearList"],
    }),
    deleteSession: builder.mutation<MessageOnlyResponse, string>({
      query: (id) => ({ url: `/academic/sessions/${id}`, method: "DELETE" }),
      invalidatesTags: ["SessionList", "YearList"],
    }),

    // ── Corrections ───────────────────────────────────────────────────────────
    requestCorrection: builder.mutation<
      WrappedResponse<ScoreCorrection>,
      {
        resultId: string;
        yearId: string;
        requestedScore: number;
        reason: string;
      }
    >({
      query: (body) => ({ url: "/academic/corrections", method: "POST", body }),
      invalidatesTags: ["CorrectionList"],
    }),
    getCorrections: builder.query<
      ScoreCorrection[],
      {
        status?: CorrectionStatus;
        resultId?: string;
        centerId?: string;
        sessionId?: string;
      } | void
    >({
      query: (params = {}) => {
        const q = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([k, v]) => v && q.set(k, v));
        }
        return `/academic/corrections?${q}`;
      },
      transformResponse: (res: unknown) => unwrapList<ScoreCorrection>(res),
      providesTags: ["CorrectionList"],
    }),
    resolveCorrection: builder.mutation<
      MessageOnlyResponse,
      { id: string; status: "approved" | "rejected"; rejectionReason?: string | null }
    >({
      query: ({ id, ...body }) => ({
        url: `/academic/corrections/${id}/resolve`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["CorrectionList", "ResultList"],
    }),
  }),
});

export const {
  useGetResultsQuery,
  useGetMyResultsQuery,
  useGetResultByIdQuery,
  useCreateResultMutation,
  useUpdateResultMutation,
  useBulkUploadResultsMutation,
  usePublishSessionResultsMutation,
  useGetSessionsQuery,
  useGetYearsQuery,
  useCreateSessionMutation,
  useDeleteSessionMutation,
  useGetStudentPerformanceQuery,
  useGetYearAnalyticsQuery,
  useGetSystemAnalyticsQuery,
  useRequestCorrectionMutation,
  useGetCorrectionsQuery,
  useResolveCorrectionMutation,
} = academicApi;
