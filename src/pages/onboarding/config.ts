export const onboardingSections = [
  {
    key: "personal",
    title: "Section 1: Personal Information",
    subtitle:
      "Mailing and residential details, contact numbers, and identity fields.",
  },
  {
    key: "spiritual",
    title: "Section 2: Spiritual Experience",
    subtitle: "Conversion, baptism experiences, and church background.",
  },
  {
    key: "education",
    title: "Section 3: Educational Experience",
    subtitle: "Add each school record with date and qualification.",
  },
  {
    key: "employment",
    title: "Section 4: Employment Status",
    subtitle: "Current employment and family annual income.",
  },
  {
    key: "declaration",
    title: "Section 5: Applicant's Declaration",
    subtitle: "Confirm agreement with School of Disciples commitments.",
  },
] as const;

export type OnboardingSectionKey = (typeof onboardingSections)[number]["key"];

export type EducationRow = {
  school: string;
  date: string;
  qualification: string;
};
