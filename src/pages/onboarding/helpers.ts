import type { IntakeFormData } from "../../utils/intake";
import { isFilled } from "../../utils/intake";
import type { EducationRow, OnboardingSectionKey } from "./config";

type EducationalExperience = NonNullable<
  IntakeFormData["educationalExperience"]
>;

export const parseEducationRows = (
  education?: EducationalExperience,
): EducationRow[] => {
  const schools = (education?.schoolsAttended || "")
    .split("\n")
    .map((item: string) => item.trim())
    .filter(Boolean);
  const dates = (education?.dates || "")
    .split("\n")
    .map((item: string) => item.trim())
    .filter(Boolean);
  const qualifications = (education?.qualificationsObtained || "")
    .split("\n")
    .map((item: string) => item.trim())
    .filter(Boolean);

  const length = Math.max(
    schools.length,
    dates.length,
    qualifications.length,
    1,
  );
  return Array.from({ length }).map((_, idx) => ({
    school: schools[idx] || "",
    date: dates[idx] || "",
    qualification: qualifications[idx] || "",
  }));
};

export const rowsToEducationFields = (rows: EducationRow[]) => ({
  schoolsAttended: rows
    .map((r) => r.school)
    .filter(Boolean)
    .join("\n"),
  dates: rows
    .map((r) => r.date)
    .filter(Boolean)
    .join("\n"),
  qualificationsObtained: rows
    .map((r) => r.qualification)
    .filter(Boolean)
    .join("\n"),
});

export const validateStep = (
  key: OnboardingSectionKey,
  intakeForm: IntakeFormData,
  educationRows: EducationRow[],
) => {
  const missing: string[] = [];

  if (key === "personal") {
    if (!isFilled(intakeForm.personalInfo?.mailingCity))
      missing.push("Mailing City");
    if (!isFilled(intakeForm.personalInfo?.mailingState))
      missing.push("Mailing State");
    if (!isFilled(intakeForm.personalInfo?.mailingZipCode)) {
      missing.push("Mailing Zip Code");
    }
    if (!isFilled(intakeForm.personalInfo?.residentialAddress)) {
      missing.push("Residential Address");
    }
    if (!isFilled(intakeForm.personalInfo?.dateOfBirth))
      missing.push("Date of Birth");
    else {
      try {
        const dob = new Date(intakeForm.personalInfo!.dateOfBirth as string);
        if (!isNaN(dob.getTime())) {
          if (dob.getTime() >= Date.now()) {
            missing.push("Date of Birth (cannot be in the future)");
          } else {
            const ageDifMs = Date.now() - dob.getTime();
            const ageDate = new Date(ageDifMs);
            const age = Math.abs(ageDate.getUTCFullYear() - 1970);
            if (age < 15)
              missing.push("Date of Birth (must be at least 15 years old)");
            else if (age > 120)
              missing.push("Date of Birth (age seems unrealistic)");
          }
        }
      } catch (e) {
        // ignore parsing errors
      }
    }
    if (!isFilled(intakeForm.personalInfo?.gender)) missing.push("Gender");
    if (!isFilled(intakeForm.personalInfo?.maritalStatus)) {
      missing.push("Marital Status");
    }
    if (!isFilled(intakeForm.personalInfo?.nationality))
      missing.push("Nationality");
    if (!isFilled(intakeForm.personalInfo?.ethnicOrigin))
      missing.push("Ethnic Origin");
    if (!isFilled(intakeForm.personalInfo?.homePhone))
      missing.push("Home Phone");
    if (!isFilled(intakeForm.personalInfo?.officePhone))
      missing.push("Office Phone");
    if (!isFilled(intakeForm.personalInfo?.email))
      missing.push("Email Address");
    if (!isFilled(intakeForm.personalInfo?.height)) missing.push("Height");
    else {
      // validate height format (feet and optional inches)
      const raw = intakeForm.personalInfo!.height as string;
      const re =
        /^\s*(\d{1,2})(?:\s*(?:'|ft|feet)\s*)?(?:(\d{1,2})\s*(?:"|in|inches)?)?\s*$/i;
      const m = raw.match(re);
      if (!m) {
        missing.push("Height (invalid format — use e.g. 5'11\")");
      } else {
        const feet = parseInt(m[1], 10);
        const inches = m[2] ? parseInt(m[2], 10) : 0;
        if (
          isNaN(feet) ||
          feet < 3 ||
          feet > 8 ||
          isNaN(inches) ||
          inches < 0 ||
          inches > 11
        ) {
          missing.push(
            "Height (invalid value — use realistic ft/in, e.g. 5'11\")",
          );
        }
      }
    }
    // heightUnit is locked to ft; ensure it's present or defaulted elsewhere
  }

  if (key === "spiritual") {
    if (!isFilled(intakeForm.spiritualExperience?.bornAgain))
      missing.push("Born Again");
    if (
      intakeForm.spiritualExperience?.bornAgain === "yes" &&
      !isFilled(intakeForm.spiritualExperience?.bornAgainWhen)
    ) {
      missing.push("Born Again - When");
    }
    if (
      intakeForm.spiritualExperience?.bornAgain === "yes" &&
      !isFilled(intakeForm.spiritualExperience?.bornAgainWhere)
    ) {
      missing.push("Born Again - Where");
    }
    if (!isFilled(intakeForm.spiritualExperience?.holyGhostBaptized)) {
      missing.push("Holy Ghost Baptized");
    }
    if (
      intakeForm.spiritualExperience?.holyGhostBaptized === "yes" &&
      !isFilled(intakeForm.spiritualExperience?.holyGhostWhen)
    ) {
      missing.push("Holy Ghost Baptized - When");
    }
    if (
      intakeForm.spiritualExperience?.holyGhostBaptized === "yes" &&
      !isFilled(intakeForm.spiritualExperience?.holyGhostWhere)
    ) {
      missing.push("Holy Ghost Baptized - Where");
    }
    if (!isFilled(intakeForm.spiritualExperience?.waterImmersionBaptized)) {
      missing.push("Water Immersion Baptized");
    }
    if (
      intakeForm.spiritualExperience?.waterImmersionBaptized === "yes" &&
      !isFilled(intakeForm.spiritualExperience?.waterImmersionWhen)
    ) {
      missing.push("Water Immersion - When");
    }
    if (
      intakeForm.spiritualExperience?.waterImmersionBaptized === "yes" &&
      !isFilled(intakeForm.spiritualExperience?.waterImmersionWhere)
    ) {
      missing.push("Water Immersion - Where");
    }
    if (!isFilled(intakeForm.spiritualExperience?.churchName))
      missing.push("Church Name");
    if (!isFilled(intakeForm.spiritualExperience?.churchLocation)) {
      missing.push("Church Location");
    }
    if (!isFilled(intakeForm.spiritualExperience?.pastorName)) {
      missing.push("Pastor's Name");
    }
  }

  if (key === "education") {
    educationRows.forEach((row, idx) => {
      if (!isFilled(row.school)) missing.push(`School ${idx + 1}`);
      if (!isFilled(row.date)) missing.push(`Date ${idx + 1}`);
      if (!isFilled(row.qualification))
        missing.push(`Qualification ${idx + 1}`);
    });
  }

  if (key === "employment") {
    if (!isFilled(intakeForm.employmentStatus?.status))
      missing.push("Employment Status");
    // Family annual income is optional
  }

  if (key === "declaration") {
    if (!isFilled(intakeForm.declaration?.agreed))
      missing.push("Declaration Agreement");
  }

  return missing;
};
