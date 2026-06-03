import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TOKEN, useURL } from "../config";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ResultStatus = "draft" | "submitted" | "published" | "locked";
export type PublicationStatus = "pending" | "approved" | "rejected";

export interface SubjectResult {
  subjectId: { _id: string; name: string; code: string; creditUnit?: number } | string;
  score: number;
  grade: string;
  remark: string;
}

export interface StudentResult {
  _id: string;
  studentId: { _id: string; firstName: string; lastName: string; matricNumber: string } | string;
  centerId: { _id: string; name: string } | string;
  sessionId: { _id: string; name: string } | string;
  termId: { _id: string; name: string } | string;
  subjects: SubjectResult[];
  totalScore: number;
  average: number;
  status: ResultStatus;
  submittedAt?: string;
  publishedAt?: string;
  lockedAt?: string;
  createdAt: string;
}

export interface ResultPublication {
  _id: string;
  centerId: { _id: string; name: string } | string;
  sessionId: { _id: string; name: string } | string;
  termId: { _id: string; name: string } | string;
  submittedBy: { _id: string; firstName: string; lastName: string } | string;
  approvedBy?: { _id: string; firstName: string; lastName: string } | string;
  status: PublicationStatus;
  rejectionReason?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface AcademicSession {
  _id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface AcademicTerm {
  _id: string;
  name: string;
  sessionId: string;
  createdAt: string;
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
  creditUnit?: number;
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

export interface StudentPerformanceData {
  sessions: {
    sessionName: string;
    termName: string;
    average: number;
    totalScore: number;
    status: string;
  }[];
  overallAverage: number;
}

export interface SubjectPerformanceSummary {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  totalStudents: number;
  gradeDistribution: Record<string, number>;
}

export interface CenterPerformanceSummary {
  centerId: string;
  centerName: string;
  totalStudents: number;
  averageScore: number;
  passRate: number;
}

export interface CenterReport {
  center: { _id: string; name: string };
  session: { _id: string; name: string };
  term: { _id: string; name: string };
  totalStudents: number;
  averageScore: number;
  passRate: number;
  gradeDistribution: Record<string, number>;
  subjectSummaries: SubjectPerformanceSummary[];
}

export interface GlobalReport {
  totalStudents: number;
  totalCenters: number;
  overallAverage: number;
  centers: CenterReport[];
}

// ── API ───────────────────────────────────────────────────────────────────────

export const academicApi = createApi({
  reducerPath: "academicApi",
  tagTypes: ["Result", "ResultList", "Publication", "PublicationList", "Session", "SessionList", "Subject", "SubjectList"],
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
    getResults: builder.query<
      ApiResponseN<StudentResult[]>,
      { studentId?: string; sessionId?: string; termId?: string; centerId?: string; status?: ResultStatus }
    >({
      query: (params = {}) => {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => v && q.set(k, v));
        return `/academic/results?${q}`;
      },
      providesTags: ["ResultList"],
    }),
    getMyResults: builder.query<ApiResponseN<StudentResult[]>, void>({
      query: () => "/academic/results/my",
      providesTags: ["ResultList"],
    }),
    getResultById: builder.query<ApiResponseN<StudentResult>, string>({
      query: (id) => `/academic/results/${id}`,
      providesTags: (_, __, id) => [{ type: "Result", id }],
    }),
    createResult: builder.mutation<
      ApiResponseN<StudentResult>,
      { studentId: string; sessionId: string; termId: string; centerId?: string; subjects: { subjectId: string; score: number }[] }
    >({
      query: (body) => ({ url: "/academic/results", method: "POST", body }),
      invalidatesTags: ["ResultList"],
    }),
    updateResult: builder.mutation<
      ApiResponseN<StudentResult>,
      { id: string; subjects?: { subjectId: string; score: number }[]; sessionId?: string; termId?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/academic/results/${id}`, method: "PATCH", body }),
      invalidatesTags: (_, __, arg) => ["ResultList", { type: "Result", id: arg.id }],
    }),
    bulkUploadResults: builder.mutation<
      ApiResponseN<BulkUploadResult>,
      FormData
    >({
      query: (formData) => ({ url: "/academic/results/bulk-upload", method: "POST", body: formData }),
      invalidatesTags: ["ResultList"],
    }),

    // ── Publication ───────────────────────────────────────────────────────────
    getPublications: builder.query<
      ApiResponseN<ResultPublication[]>,
      { centerId?: string; status?: string; sessionId?: string; termId?: string } | void
    >({
      query: (params = {}) => {
        const q = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([k, v]) => v && q.set(k, v));
        }
        return `/academic/publication?${q}`;
      },
      providesTags: ["PublicationList"],
    }),
    submitForPublication: builder.mutation<
      ApiResponseN<null>,
      { sessionId: string; termId: string; centerId?: string }
    >({
      query: (body) => ({ url: "/academic/publication", method: "POST", body }),
      invalidatesTags: ["PublicationList", "ResultList"],
    }),
    approvePublication: builder.mutation<ApiResponseN<null>, string>({
      query: (id) => ({ url: `/academic/publication/${id}/approve`, method: "PATCH" }),
      invalidatesTags: ["PublicationList", "ResultList"],
    }),
    rejectPublication: builder.mutation<
      ApiResponseN<null>,
      { id: string; rejectionReason?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/academic/publication/${id}/reject`, method: "PATCH", body }),
      invalidatesTags: ["PublicationList", "ResultList"],
    }),
    lockResults: builder.mutation<
      ApiResponseN<null>,
      { sessionId?: string; termId?: string; centerId?: string }
    >({
      query: (body) => ({ url: "/academic/publication/lock", method: "PATCH", body }),
      invalidatesTags: ["ResultList", "PublicationList"],
    }),

    // ── Sessions & Terms ─────────────────────────────────────────────────────
    getSessions: builder.query<ApiResponseN<AcademicSession[]>, void>({
      query: () => "/academic/sessions",
      providesTags: ["SessionList"],
    }),
    getTerms: builder.query<ApiResponseN<AcademicTerm[]>, { sessionId?: string } | void>({
      query: (params) => {
        if (params?.sessionId) return `/academic/sessions/terms?sessionId=${params.sessionId}`;
        return "/academic/sessions/terms";
      },
      providesTags: ["SessionList"],
    }),

    // ── Subjects ──────────────────────────────────────────────────────────────
    getSubjects: builder.query<ApiResponseN<Subject[]>, void>({
      query: () => "/academic/subjects?limit=100",
      transformResponse: (response: any) => {
        if (response && response.data && typeof response.data === "object" && "docs" in response.data) {
          return {
            ...response,
            data: response.data.docs,
          };
        }
        return response;
      },
      providesTags: ["SubjectList"],
    }),

    // ── Analytics ─────────────────────────────────────────────────────────────
    getStudentPerformance: builder.query<ApiResponseN<StudentPerformanceData>, string>({
      query: (studentId) => `/academic/analytics/student/${studentId}`,
    }),
    getSubjectAnalytics: builder.query<
      ApiResponseN<SubjectPerformanceSummary[]>,
      { sessionId?: string; termId?: string }
    >({
      query: (params = {}) => {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => v && q.set(k, v));
        return `/academic/analytics/subjects?${q}`;
      },
    }),
    getSystemAnalytics: builder.query<
      ApiResponseN<CenterPerformanceSummary[]>,
      { sessionId?: string; termId?: string }
    >({
      query: (params = {}) => {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => v && q.set(k, v));
        return `/academic/analytics/system?${q}`;
      },
    }),

    // ── Reports ───────────────────────────────────────────────────────────────
    getCenterReport: builder.query<
      ApiResponseN<CenterReport>,
      { centerId: string; sessionId: string; termId: string }
    >({
      query: ({ centerId, sessionId, termId }) =>
        `/academic/reports/center/${centerId}?sessionId=${sessionId}&termId=${termId}`,
    }),
    getGlobalReport: builder.query<
      ApiResponseN<GlobalReport>,
      { sessionId: string; termId?: string }
    >({
      query: ({ sessionId, termId }) => {
        const q = new URLSearchParams({ sessionId });
        if (termId) q.set("termId", termId);
        return `/academic/reports/global?${q}`;
      },
    }),
    // ── Session & Term mutations ──────────────────────────────────────────────
    createSession: builder.mutation<
      ApiResponseN<AcademicSession>,
      { name: string; startYear: number; endYear: number; isCurrent?: boolean }
    >({
      query: (body) => ({ url: "/academic/sessions", method: "POST", body }),
      invalidatesTags: ["SessionList"],
    }),
    deleteSession: builder.mutation<ApiResponseN<null>, string>({
      query: (id) => ({ url: `/academic/sessions/${id}`, method: "DELETE" }),
      invalidatesTags: ["SessionList"],
    }),
    createTerm: builder.mutation<
      ApiResponseN<AcademicTerm>,
      { sessionId: string; name: string; isCurrent?: boolean }
    >({
      query: (body) => ({ url: "/academic/sessions/terms", method: "POST", body }),
      invalidatesTags: ["SessionList"],
    }),
    deleteTerm: builder.mutation<ApiResponseN<null>, string>({
      query: (id) => ({ url: `/academic/sessions/terms/${id}`, method: "DELETE" }),
      invalidatesTags: ["SessionList"],
    }),

    // ── Subject mutations ─────────────────────────────────────────────────────
    createSubject: builder.mutation<
      ApiResponseN<Subject>,
      { name: string; code: string; creditUnit?: number }
    >({
      query: (body) => ({ url: "/academic/subjects", method: "POST", body }),
      invalidatesTags: ["SubjectList"],
    }),
    deleteSubject: builder.mutation<ApiResponseN<null>, string>({
      query: (id) => ({ url: `/academic/subjects/${id}`, method: "DELETE" }),
      invalidatesTags: ["SubjectList"],
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
  useGetPublicationsQuery,
  useSubmitForPublicationMutation,
  useApprovePublicationMutation,
  useRejectPublicationMutation,
  useLockResultsMutation,
  useGetSessionsQuery,
  useGetTermsQuery,
  useGetSubjectsQuery,
  useCreateSessionMutation,
  useDeleteSessionMutation,
  useCreateTermMutation,
  useDeleteTermMutation,
  useCreateSubjectMutation,
  useDeleteSubjectMutation,
  useGetStudentPerformanceQuery,
  useGetSubjectAnalyticsQuery,
  useGetSystemAnalyticsQuery,
  useGetCenterReportQuery,
  useGetGlobalReportQuery,
} = academicApi;
