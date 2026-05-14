export type IntakeFormData = {
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
    heightUnit?: "ft" | "cm";
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

type IntakeProgressSnapshot = {
  data: IntakeFormData;
  progress: number;
  step?: number;
  updatedAt: number;
};

const EMPTY_FORM: IntakeFormData = {
  personalInfo: {
    mailingCity: "",
    mailingState: "",
    mailingZipCode: "",
    residentialAddress: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    nationality: "",
    ethnicOrigin: "",
    homePhone: "",
    officePhone: "",
    email: "",
    height: "",
  },
  spiritualExperience: {
    bornAgain: undefined,
    bornAgainWhen: "",
    bornAgainWhere: "",
    holyGhostBaptized: undefined,
    holyGhostWhen: "",
    holyGhostWhere: "",
    waterImmersionBaptized: undefined,
    waterImmersionWhen: "",
    waterImmersionWhere: "",
    churchName: "",
    churchLocation: "",
    pastorName: "",
  },
  educationalExperience: {
    schoolsAttended: "",
    dates: "",
    qualificationsObtained: "",
  },
  employmentStatus: {
    status: undefined,
    familyAnnualIncome: "",
  },
  declaration: {
    agreed: false,
    name: "",
    address: "",
    signatureDate: "",
  },
};

export const cloneIntakeForm = (
  data?: IntakeFormData,
  defaults?: { email?: string; phone?: string },
): IntakeFormData => ({
  personalInfo: {
    ...EMPTY_FORM.personalInfo,
    ...(data?.personalInfo || {}),
    email: data?.personalInfo?.email || defaults?.email || "",
    homePhone: data?.personalInfo?.homePhone || defaults?.phone || "",
  },
  spiritualExperience: {
    ...EMPTY_FORM.spiritualExperience,
    ...(data?.spiritualExperience || {}),
  },
  educationalExperience: {
    ...EMPTY_FORM.educationalExperience,
    ...(data?.educationalExperience || {}),
  },
  employmentStatus: {
    ...EMPTY_FORM.employmentStatus,
    ...(data?.employmentStatus || {}),
  },
  declaration: {
    ...EMPTY_FORM.declaration,
    ...(data?.declaration || {}),
  },
});

export const isFilled = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
};

export const calculateProgress = (data: IntakeFormData) => {
  if (!data) return 0;
  const items: unknown[] = [];
  const push = (...values: unknown[]) => items.push(...values);

  push(
    data.personalInfo?.mailingCity,
    data.personalInfo?.mailingState,
    data.personalInfo?.mailingZipCode,
    data.personalInfo?.residentialAddress,
    data.personalInfo?.dateOfBirth,
    data.personalInfo?.gender,
    data.personalInfo?.maritalStatus,
    data.personalInfo?.nationality,
    data.personalInfo?.ethnicOrigin,
    data.personalInfo?.homePhone,
    data.personalInfo?.officePhone,
    data.personalInfo?.email,
    data.personalInfo?.height,
    data.personalInfo?.heightUnit,
  );

  push(
    data.spiritualExperience?.bornAgain,
    data.spiritualExperience?.bornAgain === "yes"
      ? data.spiritualExperience?.bornAgainWhen
      : true,
    data.spiritualExperience?.bornAgain === "yes"
      ? data.spiritualExperience?.bornAgainWhere
      : true,
    data.spiritualExperience?.holyGhostBaptized,
    data.spiritualExperience?.holyGhostBaptized === "yes"
      ? data.spiritualExperience?.holyGhostWhen
      : true,
    data.spiritualExperience?.holyGhostBaptized === "yes"
      ? data.spiritualExperience?.holyGhostWhere
      : true,
    data.spiritualExperience?.waterImmersionBaptized,
    data.spiritualExperience?.waterImmersionBaptized === "yes"
      ? data.spiritualExperience?.waterImmersionWhen
      : true,
    data.spiritualExperience?.waterImmersionBaptized === "yes"
      ? data.spiritualExperience?.waterImmersionWhere
      : true,
    data.spiritualExperience?.churchName,
    data.spiritualExperience?.churchLocation,
    data.spiritualExperience?.pastorName,
  );

  push(
    data.educationalExperience?.schoolsAttended,
    data.educationalExperience?.dates,
    data.educationalExperience?.qualificationsObtained,
  );

  push(data.employmentStatus?.status, data.employmentStatus?.familyAnnualIncome);
  push(data.declaration?.agreed);

  const completed = items.filter(isFilled).length;
  return items.length ? Math.round((completed / items.length) * 100) : 0;
};

const keyFor = (userId?: string) => (userId ? `intake_${userId}` : `intake_draft`);

export const saveLocalIntake = (
  userId: string | undefined,
  data: IntakeFormData,
  options?: { step?: number },
) => {
  try {
    const progress = calculateProgress(data);
    const payload: IntakeProgressSnapshot = {
      data,
      progress,
      step: options?.step,
      updatedAt: Date.now(),
    };
    localStorage.setItem(keyFor(userId), JSON.stringify(payload));
  } catch (e) {
    // ignore
  }
};

export const getLocalIntake = (userId: string | undefined) => {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (!raw) return null;
    return JSON.parse(raw) as IntakeProgressSnapshot;
  } catch (e) {
    return null;
  }
};

export const clearLocalIntake = (userId: string | undefined) => {
  try {
    localStorage.removeItem(keyFor(userId));
  } catch (e) {}
};

export const hasCompletedIntake = (user?: User | null) =>
  user?.intakeFormStatus === "completed" ||
  user?.intakeFormStatus === "submitted" ||
  (user?.intakeFormProgress ?? 0) >= 100;
