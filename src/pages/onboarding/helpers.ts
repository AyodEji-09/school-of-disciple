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

export const validateStepErrors = (
  key: OnboardingSectionKey,
  intakeForm: IntakeFormData,
  educationRows: EducationRow[],
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (key === "personal") {
    if (!isFilled(intakeForm.personalInfo?.mailingCity))
      errors["personalInfo.mailingCity"] = "Mailing city is required";
    if (!isFilled(intakeForm.personalInfo?.mailingState))
      errors["personalInfo.mailingState"] = "Mailing state is required";
    if (!isFilled(intakeForm.personalInfo?.mailingZipCode))
      errors["personalInfo.mailingZipCode"] = "Mailing zip code is required";
    if (!isFilled(intakeForm.personalInfo?.residentialAddress))
      errors["personalInfo.residentialAddress"] =
        "Residential address is required";
    if (!isFilled(intakeForm.personalInfo?.dateOfBirth)) {
      errors["personalInfo.dateOfBirth"] = "Date of birth is required";
    } else {
      try {
        const dob = new Date(intakeForm.personalInfo!.dateOfBirth as string);
        if (!isNaN(dob.getTime())) {
          if (dob.getTime() >= Date.now()) {
            errors["personalInfo.dateOfBirth"] =
              "Date of birth cannot be in the future";
          } else {
            const ageDifMs = Date.now() - dob.getTime();
            const ageDate = new Date(ageDifMs);
            const age = Math.abs(ageDate.getUTCFullYear() - 1970);
            if (age < 15)
              errors["personalInfo.dateOfBirth"] =
                "Must be at least 15 years old";
            else if (age > 120)
              errors["personalInfo.dateOfBirth"] = "Please enter a valid date";
          }
        }
      } catch {
        // ignore parsing errors
      }
    }
    if (!isFilled(intakeForm.personalInfo?.gender))
      errors["personalInfo.gender"] = "Please select a gender";
    if (!isFilled(intakeForm.personalInfo?.maritalStatus))
      errors["personalInfo.maritalStatus"] = "Please select a marital status";
    if (!isFilled(intakeForm.personalInfo?.nationality))
      errors["personalInfo.nationality"] = "Nationality is required";
    if (!isFilled(intakeForm.personalInfo?.ethnicOrigin))
      errors["personalInfo.ethnicOrigin"] = "Ethnic origin is required";
    if (!isFilled(intakeForm.personalInfo?.homePhone))
      errors["personalInfo.homePhone"] = "Home phone is required";
    if (!isFilled(intakeForm.personalInfo?.officePhone))
      errors["personalInfo.officePhone"] = "Office phone is required";
    if (!isFilled(intakeForm.personalInfo?.email))
      errors["personalInfo.email"] = "Email address is required";
    if (!isFilled(intakeForm.personalInfo?.height))
      errors["personalInfo.height"] = "Please select your height";
  }

  if (key === "spiritual") {
    if (!isFilled(intakeForm.spiritualExperience?.bornAgain))
      errors["spiritualExperience.bornAgain"] = "Please select an option";
    if (
      intakeForm.spiritualExperience?.bornAgain === "yes" &&
      !isFilled(intakeForm.spiritualExperience?.bornAgainWhen)
    ) {
      errors["spiritualExperience.bornAgainWhen"] = "Please specify when";
    }
    if (
      intakeForm.spiritualExperience?.bornAgain === "yes" &&
      !isFilled(intakeForm.spiritualExperience?.bornAgainWhere)
    ) {
      errors["spiritualExperience.bornAgainWhere"] = "Please specify where";
    }
    if (!isFilled(intakeForm.spiritualExperience?.holyGhostBaptized))
      errors["spiritualExperience.holyGhostBaptized"] =
        "Please select an option";
    if (
      intakeForm.spiritualExperience?.holyGhostBaptized === "yes" &&
      !isFilled(intakeForm.spiritualExperience?.holyGhostWhen)
    ) {
      errors["spiritualExperience.holyGhostWhen"] = "Please specify when";
    }
    if (
      intakeForm.spiritualExperience?.holyGhostBaptized === "yes" &&
      !isFilled(intakeForm.spiritualExperience?.holyGhostWhere)
    ) {
      errors["spiritualExperience.holyGhostWhere"] = "Please specify where";
    }
    if (!isFilled(intakeForm.spiritualExperience?.waterImmersionBaptized))
      errors["spiritualExperience.waterImmersionBaptized"] =
        "Please select an option";
    if (
      intakeForm.spiritualExperience?.waterImmersionBaptized === "yes" &&
      !isFilled(intakeForm.spiritualExperience?.waterImmersionWhen)
    ) {
      errors["spiritualExperience.waterImmersionWhen"] = "Please specify when";
    }
    if (
      intakeForm.spiritualExperience?.waterImmersionBaptized === "yes" &&
      !isFilled(intakeForm.spiritualExperience?.waterImmersionWhere)
    ) {
      errors["spiritualExperience.waterImmersionWhere"] =
        "Please specify where";
    }
    if (!isFilled(intakeForm.spiritualExperience?.churchName))
      errors["spiritualExperience.churchName"] = "Church name is required";
    if (!isFilled(intakeForm.spiritualExperience?.churchLocation))
      errors["spiritualExperience.churchLocation"] =
        "Church location is required";
    if (!isFilled(intakeForm.spiritualExperience?.pastorName))
      errors["spiritualExperience.pastorName"] = "Pastor's name is required";
  }

  if (key === "education") {
    educationRows.forEach((row, idx) => {
      if (!isFilled(row.school))
        errors[`education.${idx}.school`] = "School name is required";
      if (!isFilled(row.date))
        errors[`education.${idx}.date`] = "Date is required";
      if (!isFilled(row.qualification))
        errors[`education.${idx}.qualification`] = "Qualification is required";
    });
  }

  if (key === "employment") {
    if (!isFilled(intakeForm.employmentStatus?.status))
      errors["employmentStatus.status"] =
        "Please select your employment status";
  }

  if (key === "declaration") {
    if (!isFilled(intakeForm.declaration?.agreed))
      errors["declaration.agreed"] =
        "You must agree to the declaration to submit";
  }

  return errors;
};
