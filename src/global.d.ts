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
  matricNumber: string;
  paymentStatus: string;
  avatar: avatarObject;
  emailVerified: boolean;
  type: string;
  address: string;
  state?: string;
  description: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    tiktok?: string;
    website?: string;
  };
  age: string;
  birthday: Date;
  gender: string;
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
  label: string;
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
  academicYear?: string;
  createdAt: string;
  updatedAt?: string;
};
