import Input from "../../../components/input/input.component";
import { HEIGHT_OPTIONS, type IntakeFormData } from "../../../utils/intake";
import type { EducationRow } from "../config";
import SelectField from "./SelectField";

type UpdateNested = <
  T extends keyof IntakeFormData,
  K extends keyof NonNullable<IntakeFormData[T]>,
>(
  section: T,
  key: K,
  value: NonNullable<IntakeFormData[T]>[K],
) => void;

type FieldErrors = Record<string, string>;

export const PersonalSectionView = ({
  intakeForm,
  updateNested,
  userEmail,
  errors = {},
}: {
  intakeForm: IntakeFormData;
  updateNested: UpdateNested;
  userEmail?: string;
  errors?: FieldErrors;
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
    <Input
      label="Mailing Address - City"
      value={intakeForm.personalInfo?.mailingCity || ""}
      error={errors["personalInfo.mailingCity"]}
      onChange={(e) =>
        updateNested("personalInfo", "mailingCity", e.target.value)
      }
    />
    <Input
      label="Mailing Address - State"
      value={intakeForm.personalInfo?.mailingState || ""}
      error={errors["personalInfo.mailingState"]}
      onChange={(e) =>
        updateNested("personalInfo", "mailingState", e.target.value)
      }
    />
    <Input
      label="Mailing Address - Zip Code"
      value={intakeForm.personalInfo?.mailingZipCode || ""}
      error={errors["personalInfo.mailingZipCode"]}
      onChange={(e) =>
        updateNested("personalInfo", "mailingZipCode", e.target.value)
      }
    />
    <Input
      label="Residential Address"
      value={intakeForm.personalInfo?.residentialAddress || ""}
      error={errors["personalInfo.residentialAddress"]}
      onChange={(e) =>
        updateNested("personalInfo", "residentialAddress", e.target.value)
      }
    />
    {(() => {
      const today = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const minDob = `${today.getFullYear() - 120}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
      const maxDate = new Date(
        today.getFullYear() - 15,
        today.getMonth(),
        today.getDate(),
      );
      const maxDob = `${maxDate.getFullYear()}-${pad(maxDate.getMonth() + 1)}-${pad(maxDate.getDate())}`;
      return (
        <Input
          label="Date of Birth"
          type="date"
          min={minDob}
          max={maxDob}
          value={intakeForm.personalInfo?.dateOfBirth || ""}
          error={errors["personalInfo.dateOfBirth"]}
          onChange={(e) =>
            updateNested("personalInfo", "dateOfBirth", e.target.value)
          }
        />
      );
    })()}
    <SelectField
      label="Gender"
      value={intakeForm.personalInfo?.gender || ""}
      error={errors["personalInfo.gender"]}
      onChange={(value) => updateNested("personalInfo", "gender", value)}
      options={[
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
      ]}
    />
    <SelectField
      label="Marital Status"
      value={intakeForm.personalInfo?.maritalStatus || ""}
      error={errors["personalInfo.maritalStatus"]}
      onChange={(value) => updateNested("personalInfo", "maritalStatus", value)}
      options={[
        { value: "single", label: "Single" },
        { value: "married", label: "Married" },
        { value: "divorced", label: "Divorced" },
        { value: "widowed", label: "Widowed" },
      ]}
    />
    <Input
      label="Nationality"
      value={intakeForm.personalInfo?.nationality || ""}
      error={errors["personalInfo.nationality"]}
      onChange={(e) =>
        updateNested("personalInfo", "nationality", e.target.value)
      }
    />
    <Input
      label="Ethnic Origin"
      value={intakeForm.personalInfo?.ethnicOrigin || ""}
      error={errors["personalInfo.ethnicOrigin"]}
      onChange={(e) =>
        updateNested("personalInfo", "ethnicOrigin", e.target.value)
      }
    />
    <Input
      label="Home Phone"
      value={intakeForm.personalInfo?.homePhone || ""}
      error={errors["personalInfo.homePhone"]}
      onChange={(e) =>
        updateNested("personalInfo", "homePhone", e.target.value)
      }
    />
    <Input
      label="Office Phone"
      value={intakeForm.personalInfo?.officePhone || ""}
      error={errors["personalInfo.officePhone"]}
      onChange={(e) =>
        updateNested("personalInfo", "officePhone", e.target.value)
      }
    />
    <Input
      label="Email Address"
      type="email"
      value={intakeForm.personalInfo?.email || userEmail || ""}
      error={errors["personalInfo.email"]}
      onChange={(e) => updateNested("personalInfo", "email", e.target.value)}
    />
    <SelectField
      label="Height"
      value={intakeForm.personalInfo?.height || ""}
      error={errors["personalInfo.height"]}
      onChange={(v) => updateNested("personalInfo", "height", v)}
      options={HEIGHT_OPTIONS}
    />
  </div>
);

export const SpiritualSectionView = ({
  intakeForm,
  updateNested,
  errors = {},
}: {
  intakeForm: IntakeFormData;
  updateNested: UpdateNested;
  errors?: FieldErrors;
}) => {
  const bornAgain = intakeForm.spiritualExperience?.bornAgain;
  const holyGhostBaptized = intakeForm.spiritualExperience?.holyGhostBaptized;
  const waterImmersionBaptized =
    intakeForm.spiritualExperience?.waterImmersionBaptized;

  const clearSpiritualFollowUps = (
    key: "bornAgain" | "holyGhostBaptized" | "waterImmersionBaptized",
    value: "yes" | "no",
  ) => {
    updateNested("spiritualExperience", key, value);

    if (value === "yes") return;

    if (key === "bornAgain") {
      updateNested("spiritualExperience", "bornAgainWhen", "");
      updateNested("spiritualExperience", "bornAgainWhere", "");
    }

    if (key === "holyGhostBaptized") {
      updateNested("spiritualExperience", "holyGhostWhen", "");
      updateNested("spiritualExperience", "holyGhostWhere", "");
    }

    if (key === "waterImmersionBaptized") {
      updateNested("spiritualExperience", "waterImmersionWhen", "");
      updateNested("spiritualExperience", "waterImmersionWhere", "");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif font-bold text-navy text-base mb-4">
          Salvation Experience
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <SelectField
            label="Have you been born again?"
            value={intakeForm.spiritualExperience?.bornAgain || ""}
            error={errors["spiritualExperience.bornAgain"]}
            onChange={(value) =>
              clearSpiritualFollowUps("bornAgain", value as "yes" | "no")
            }
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
          />
          {bornAgain === "yes" && (
            <>
              <Input
                label="When?"
                value={intakeForm.spiritualExperience?.bornAgainWhen || ""}
                error={errors["spiritualExperience.bornAgainWhen"]}
                onChange={(e) =>
                  updateNested(
                    "spiritualExperience",
                    "bornAgainWhen",
                    e.target.value,
                  )
                }
              />
              <Input
                label="Where?"
                value={intakeForm.spiritualExperience?.bornAgainWhere || ""}
                error={errors["spiritualExperience.bornAgainWhere"]}
                onChange={(e) =>
                  updateNested(
                    "spiritualExperience",
                    "bornAgainWhere",
                    e.target.value,
                  )
                }
              />
            </>
          )}
        </div>
      </div>

      <div className="border-t border-bordergray pt-6">
        <h3 className="font-serif font-bold text-navy text-base mb-4">
          Baptism Experience
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-start">
          <div className="space-y-4">
            <SelectField
              label="Baptised in the Holy Ghost?"
              value={intakeForm.spiritualExperience?.holyGhostBaptized || ""}
              error={errors["spiritualExperience.holyGhostBaptized"]}
              onChange={(value) =>
                clearSpiritualFollowUps(
                  "holyGhostBaptized",
                  value as "yes" | "no",
                )
              }
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
            {holyGhostBaptized === "yes" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="When?"
                  value={intakeForm.spiritualExperience?.holyGhostWhen || ""}
                  error={errors["spiritualExperience.holyGhostWhen"]}
                  onChange={(e) =>
                    updateNested(
                      "spiritualExperience",
                      "holyGhostWhen",
                      e.target.value,
                    )
                  }
                />
                <Input
                  label="Where?"
                  value={intakeForm.spiritualExperience?.holyGhostWhere || ""}
                  error={errors["spiritualExperience.holyGhostWhere"]}
                  onChange={(e) =>
                    updateNested(
                      "spiritualExperience",
                      "holyGhostWhere",
                      e.target.value,
                    )
                  }
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <SelectField
              label="Baptized in water immersion?"
              value={
                intakeForm.spiritualExperience?.waterImmersionBaptized || ""
              }
              error={errors["spiritualExperience.waterImmersionBaptized"]}
              onChange={(value) =>
                clearSpiritualFollowUps(
                  "waterImmersionBaptized",
                  value as "yes" | "no",
                )
              }
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
            {waterImmersionBaptized === "yes" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="When?"
                  value={
                    intakeForm.spiritualExperience?.waterImmersionWhen || ""
                  }
                  error={errors["spiritualExperience.waterImmersionWhen"]}
                  onChange={(e) =>
                    updateNested(
                      "spiritualExperience",
                      "waterImmersionWhen",
                      e.target.value,
                    )
                  }
                />
                <Input
                  label="Where?"
                  value={
                    intakeForm.spiritualExperience?.waterImmersionWhere || ""
                  }
                  error={errors["spiritualExperience.waterImmersionWhere"]}
                  onChange={(e) =>
                    updateNested(
                      "spiritualExperience",
                      "waterImmersionWhere",
                      e.target.value,
                    )
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-bordergray pt-6">
        <h3 className="font-serif font-bold text-navy text-base mb-4">
          Church Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <Input
            label="Church Name"
            value={intakeForm.spiritualExperience?.churchName || ""}
            error={errors["spiritualExperience.churchName"]}
            onChange={(e) =>
              updateNested("spiritualExperience", "churchName", e.target.value)
            }
          />
          <Input
            label="Church Location"
            value={intakeForm.spiritualExperience?.churchLocation || ""}
            error={errors["spiritualExperience.churchLocation"]}
            onChange={(e) =>
              updateNested(
                "spiritualExperience",
                "churchLocation",
                e.target.value,
              )
            }
          />
          <Input
            label="Pastor's Name"
            value={intakeForm.spiritualExperience?.pastorName || ""}
            error={errors["spiritualExperience.pastorName"]}
            onChange={(e) =>
              updateNested("spiritualExperience", "pastorName", e.target.value)
            }
          />
        </div>
      </div>
    </div>
  );
};

export const EducationSectionView = ({
  educationRows,
  updateEducationRow,
  removeEducationRow,
  addEducationRow,
  errors = {},
}: {
  educationRows: EducationRow[];
  updateEducationRow: (
    index: number,
    key: keyof EducationRow,
    value: string,
  ) => void;
  removeEducationRow: (index: number) => void;
  addEducationRow: () => void;
  errors?: FieldErrors;
}) => (
  <div className="space-y-6">
    {educationRows.map((row, idx) => (
      <div
        key={idx}
        className={idx > 0 ? "border-t border-bordergray pt-6" : ""}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-navy text-base">
            School Record {idx + 1}
          </h3>
          {educationRows.length > 1 && (
            <button
              type="button"
              onClick={() => removeEducationRow(idx)}
              className="text-xs font-semibold text-error hover:underline cursor-pointer"
            >
              Remove
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <Input
            label="School"
            value={row.school}
            error={errors[`education.${idx}.school`]}
            onChange={(e) => updateEducationRow(idx, "school", e.target.value)}
          />
          <Input
            label="Date"
            type="date"
            value={row.date}
            error={errors[`education.${idx}.date`]}
            onChange={(e) => updateEducationRow(idx, "date", e.target.value)}
          />
          <Input
            label="Qualification"
            value={row.qualification}
            error={errors[`education.${idx}.qualification`]}
            onChange={(e) =>
              updateEducationRow(idx, "qualification", e.target.value)
            }
          />
        </div>
      </div>
    ))}

    <button
      type="button"
      onClick={addEducationRow}
      className="inline-flex items-center justify-center h-10 px-5 rounded-md border border-navy text-navy hover:bg-coolgray font-sans font-semibold text-sm transition-colors cursor-pointer"
    >
      + Add More School
    </button>
  </div>
);

export const EmploymentSectionView = ({
  intakeForm,
  updateNested,
  errors = {},
}: {
  intakeForm: IntakeFormData;
  updateNested: UpdateNested;
  errors?: FieldErrors;
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
    <SelectField
      label="What is your current Employment Status?"
      value={intakeForm.employmentStatus?.status || ""}
      error={errors["employmentStatus.status"]}
      onChange={(value) =>
        updateNested(
          "employmentStatus",
          "status",
          value as "Employed" | "Unemployed" | "Retired",
        )
      }
      options={[
        { value: "Employed", label: "Employed" },
        { value: "Unemployed", label: "Unemployed" },
        { value: "Retired", label: "Retired" },
      ]}
    />
  </div>
);

export const DeclarationSectionView = ({
  intakeForm,
  updateNested,
  errors = {},
}: {
  intakeForm: IntakeFormData;
  updateNested: UpdateNested;
  errors?: FieldErrors;
}) => (
  <div className="space-y-5">
    <p className="text-sm sm:text-base leading-relaxed text-charcoal max-w-3xl">
      I hereby promise, if accepted as a student, to abide by the rules and
      regulations of the SCHOOL of DISCIPLES, to obey the Authorities of the
      school and pray for them. I also promise to fulfill all financial
      obligations and not to put a stumbling block in the way of my fellow
      students.
    </p>
    <div>
      <label className="inline-flex items-start gap-3 text-sm sm:text-base font-medium text-navy cursor-pointer select-none">
        <input
          type="checkbox"
          checked={Boolean(intakeForm.declaration?.agreed)}
          aria-invalid={Boolean(errors["declaration.agreed"])}
          onChange={(e) =>
            updateNested("declaration", "agreed", e.target.checked)
          }
          className="mt-1 h-4 w-4 rounded border-mist accent-navy cursor-pointer"
        />
        <span>I agree to this declaration.</span>
      </label>
      {errors["declaration.agreed"] && (
        <p className="font-sans text-xs font-normal text-error mt-1.5">
          {errors["declaration.agreed"]}
        </p>
      )}
    </div>
  </div>
);
