type ApiResponse<T> = {
  data: {
    docs: T[];
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
    nextPage: number;
    page: number;
    previousPage: null;
    totalItems: number;
    totalPages: number;
  };
  message: string;
};

type ApiResponseN<T> = {
  data?: T;
  message: string;
};

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  departmentCode: string;
  admissionYear: number;
  admissionSessionId?: string;
  academicYear?: string;
  matricNumber: string;
  paymentStatus: string;
  avatar: avatarObject;
  emailVerified: boolean;
  type: string;
  address?: string;
  state?: string;
  description?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    tiktok?: string;
    website?: string;
  };
  age?: string;
  birthday?: Date;
  gender?: string;
  status: string;
  loginLast: Date;
  deactivated: boolean;
  coordinatorStatus?: "assigned" | "unassigned" | "deactivated" | "pending";
  coordinatorAssignedAt?: Date | null;
  coordinatorUnassignedAt?: Date | null;
  coordinatorUnassignedReason?: string | null;
  unassignedAt?: Date | null;
  intakeFormStatus?: "draft" | "in_progress" | "completed" | "submitted";
  intakeFormProgress?: number;
  intakeCompletedAt?: Date | null;
  intakeFormData?: {
    personalInfo?: {
      mailingCity?: string;
      mailingState?: string;
      mailingZipCode?: string;
      residentialAddress?: string;
      dateOfBirth?: string;
      gender?: string;
      maritalStatus?: string;
      nationality?: string;
      ethnicOrigin?: string;
      homePhone?: string;
      officePhone?: string;
      email?: string;
      height?: string;
    };
    spiritualExperience?: {
      bornAgain?: "yes" | "no";
      bornAgainWhen?: string;
      bornAgainWhere?: string;
      holyGhostBaptized?: "yes" | "no";
      holyGhostWhen?: string;
      holyGhostWhere?: string;
      waterImmersionBaptized?: "yes" | "no";
      waterImmersionWhen?: string;
      waterImmersionWhere?: string;
      churchName?: string;
      churchLocation?: string;
      pastorName?: string;
    };
    educationalExperience?: {
      schoolsAttended?: string;
      dates?: string;
      qualificationsObtained?: string;
    };
    employmentStatus?: {
      status?: "Employed" | "Unemployed" | "Retired";
      familyAnnualIncome?: string;
    };
    declaration?: {
      agreed?: boolean;
      name?: string;
      address?: string;
      signatureDate?: string;
    };
  };
  admin: boolean;
  center?: Center | string | null;
  createdAt: Date;
};

interface avatarObject {
  publicId: string;
  url: string;
}

type ApiError = {
  response?: {
    data: { message: string };
  };
  message: string;
};

type Center = {
  _id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  landmark?: string;
  manager?: User | string | null;
};

type Payment = {
  _id: string;
  studentId: string | User;
  stripeSessionId: string;
  amount: number;
  currency?: string;
  description: string;
  paymentType: "registration" | "manuals" | "custom";
  status: string;
  paidAt?: Date;
  receiptUrl?: string;
  academicYear?: string;
  createdAt: Date;
  updatedAt?: Date;
};

type RegistrationWindow = {
  _id: string;
  startDate: string;
  endDate: string;
  sessionId: string | AcademicSession;
  label?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
};

type Remittance = {
  _id: string;
  coordinatorId: string | User;
  centerId: string | Center;
  amount: number;
  method: "stripe" | "zelle";
  status: "pending_confirmation" | "paid" | "rejected";
  stripeSessionId?: string;
  description?: string;
  confirmedBy?: string | User;
  confirmedAt?: string;
  rejectedReason?: string;
  receiptUrl?: string;
  receiptImageUrl?: string;
  academicYear?: string;
  createdAt: string;
  updatedAt?: string;
};

type ManualOrder = {
  _id: string;
  coordinatorId: string | User;
  coordinatorEmail: string;
  coordinatorName: string;
  centerId: string | Center;
  centerName: string;
  zone: string;
  phone: string;
  zonalRegionalCoordinatorName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  mailingAddress: string;
  concerns?: string;
  paymentMethod: "stripe" | "zelle";
  status:
    | "pending_payment"
    | "pending_confirmation"
    | "paid"
    | "rejected"
    | "processing"
    | "completed";
  stripeSessionId?: string;
  receiptUrl?: string;
  confirmedBy?: string | User;
  confirmedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt?: string;
};

// ── Academic ──────────────────────────────────────────────────────────────────

type AcademicSession = {
  _id: string;
  name: string;
  startYear: number;
  endYear: number;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
};

type AcademicYear = {
  _id: string;
  name: string;
  number: number;
  sessionId: { _id: string; name: string } | string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt?: string;
};

type YearScore = {
  yearId: { _id: string; name: string; number: number } | string;
  score: number;
};

type ResultStatus = "draft" | "published";

type StudentResult = {
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
};

type CorrectionStatus = "pending" | "approved" | "rejected";

type ScoreCorrection = {
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
};
