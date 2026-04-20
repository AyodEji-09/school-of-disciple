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
  description: string;
  age: string;
  birthday: Date;
  gender: string;
  status: string;
  loginLast: Date;
  deactivated: boolean;
  admin: boolean;
  center: Center;
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
  manager: User;
};

type Payment = {
  _id: string;
  studentId: string | User;
  stripeSessionId: string;
  amount: number;
  status: string;
  paidAt: Date;
  createdAt: Date;
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
