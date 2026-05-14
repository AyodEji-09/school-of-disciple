import { Button } from "@mui/material";
import { Card, Typography } from "@mui/joy";
import Input from "../../../components/input/input.component";
import type { IntakeFormData } from "../../../utils/intake";
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

export const PersonalSectionView = ({
  intakeForm,
  updateNested,
  userEmail,
}: {
  intakeForm: IntakeFormData;
  updateNested: UpdateNested;
  userEmail?: string;
}) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
    <Input
      label="Mailing Address - City"
      value={intakeForm.personalInfo?.mailingCity || ""}
      onChange={(e) => updateNested("personalInfo", "mailingCity", e.target.value)}
    />
    <Input
      label="Mailing Address - State"
      value={intakeForm.personalInfo?.mailingState || ""}
      onChange={(e) => updateNested("personalInfo", "mailingState", e.target.value)}
    />
    <Input
      label="Mailing Address - Zip Code"
      value={intakeForm.personalInfo?.mailingZipCode || ""}
      onChange={(e) => updateNested("personalInfo", "mailingZipCode", e.target.value)}
    />
    <Input
      label="Residential Address"
      value={intakeForm.personalInfo?.residentialAddress || ""}
      onChange={(e) =>
        updateNested("personalInfo", "residentialAddress", e.target.value)
      }
    />
    <Input
      label="Date of Birth"
      type="date"
      value={intakeForm.personalInfo?.dateOfBirth || ""}
      onChange={(e) => updateNested("personalInfo", "dateOfBirth", e.target.value)}
    />
    <SelectField
      label="Gender"
      value={intakeForm.personalInfo?.gender || ""}
      onChange={(value) => updateNested("personalInfo", "gender", value)}
      options={[
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other" },
      ]}
    />
    <SelectField
      label="Marital Status"
      value={intakeForm.personalInfo?.maritalStatus || ""}
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
      onChange={(e) => updateNested("personalInfo", "nationality", e.target.value)}
    />
    <Input
      label="Ethnic Origin"
      value={intakeForm.personalInfo?.ethnicOrigin || ""}
      onChange={(e) => updateNested("personalInfo", "ethnicOrigin", e.target.value)}
    />
    <Input
      label="Home Phone"
      value={intakeForm.personalInfo?.homePhone || ""}
      onChange={(e) => updateNested("personalInfo", "homePhone", e.target.value)}
    />
    <Input
      label="Office Phone"
      value={intakeForm.personalInfo?.officePhone || ""}
      onChange={(e) => updateNested("personalInfo", "officePhone", e.target.value)}
    />
    <Input
      label="Email Address"
      type="email"
      value={intakeForm.personalInfo?.email || userEmail || ""}
      onChange={(e) => updateNested("personalInfo", "email", e.target.value)}
    />
    <div className="flex gap-2">
      <Input
        label="Height"
        className="flex-1"
        value={intakeForm.personalInfo?.height || ""}
        onChange={(e) => updateNested("personalInfo", "height", e.target.value)}
        placeholder={intakeForm.personalInfo?.heightUnit === "ft" ? "e.g. 5'11\"" : "e.g. 180"}
      />
      <SelectField
        label="Unit"
        sx={{ minWidth: 100 }}
        value={intakeForm.personalInfo?.heightUnit || ""}
        onChange={(value) => updateNested("personalInfo", "heightUnit", value as "ft" | "cm")}
        options={[
          { value: "ft", label: "ft/in" },
          { value: "cm", label: "cm" },
        ]}
      />
    </div>
  </div>
);

export const SpiritualSectionView = ({
  intakeForm,
  updateNested,
}: {
  intakeForm: IntakeFormData;
  updateNested: UpdateNested;
}) => (
  <>
    <Card variant="soft" className="p-4">
      <Typography level="title-sm" textColor="#001F54" sx={{ mb: 1 }}>
        Salvation Experience
      </Typography>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SelectField
          label="Have you been born again?"
          value={intakeForm.spiritualExperience?.bornAgain || ""}
          onChange={(value) =>
            updateNested("spiritualExperience", "bornAgain", value as "yes" | "no")
          }
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
        />
        <Input
          label="If yes, when?"
          value={intakeForm.spiritualExperience?.bornAgainWhen || ""}
          onChange={(e) =>
            updateNested("spiritualExperience", "bornAgainWhen", e.target.value)
          }
        />
        <Input
          label="If yes, where?"
          value={intakeForm.spiritualExperience?.bornAgainWhere || ""}
          onChange={(e) =>
            updateNested("spiritualExperience", "bornAgainWhere", e.target.value)
          }
        />
      </div>
    </Card>

    <Card variant="soft" className="p-4">
      <Typography level="title-sm" textColor="#001F54" sx={{ mb: 1 }}>
        Baptism Experience
      </Typography>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SelectField
          label="Baptised in the Holy Ghost?"
          value={intakeForm.spiritualExperience?.holyGhostBaptized || ""}
          onChange={(value) =>
            updateNested(
              "spiritualExperience",
              "holyGhostBaptized",
              value as "yes" | "no",
            )
          }
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
        />
        <Input
          label="If yes, when?"
          value={intakeForm.spiritualExperience?.holyGhostWhen || ""}
          onChange={(e) =>
            updateNested("spiritualExperience", "holyGhostWhen", e.target.value)
          }
        />
        <Input
          label="If yes, where?"
          value={intakeForm.spiritualExperience?.holyGhostWhere || ""}
          onChange={(e) =>
            updateNested("spiritualExperience", "holyGhostWhere", e.target.value)
          }
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4">
        <SelectField
          label="Baptized in water immersion?"
          value={intakeForm.spiritualExperience?.waterImmersionBaptized || ""}
          onChange={(value) =>
            updateNested(
              "spiritualExperience",
              "waterImmersionBaptized",
              value as "yes" | "no",
            )
          }
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
        />
        <Input
          label="If yes, when?"
          value={intakeForm.spiritualExperience?.waterImmersionWhen || ""}
          onChange={(e) =>
            updateNested("spiritualExperience", "waterImmersionWhen", e.target.value)
          }
        />
        <Input
          label="If yes, where?"
          value={intakeForm.spiritualExperience?.waterImmersionWhere || ""}
          onChange={(e) =>
            updateNested("spiritualExperience", "waterImmersionWhere", e.target.value)
          }
        />
      </div>
    </Card>

    <Card variant="soft" className="p-4">
      <Typography level="title-sm" textColor="#001F54" sx={{ mb: 1 }}>
        Church Information
      </Typography>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Input
          label="Church Name"
          value={intakeForm.spiritualExperience?.churchName || ""}
          onChange={(e) =>
            updateNested("spiritualExperience", "churchName", e.target.value)
          }
        />
        <Input
          label="Church Location"
          value={intakeForm.spiritualExperience?.churchLocation || ""}
          onChange={(e) =>
            updateNested("spiritualExperience", "churchLocation", e.target.value)
          }
        />
        <Input
          label="Pastor's Name"
          value={intakeForm.spiritualExperience?.pastorName || ""}
          onChange={(e) =>
            updateNested("spiritualExperience", "pastorName", e.target.value)
          }
        />
      </div>
    </Card>
  </>
);

export const EducationSectionView = ({
  educationRows,
  updateEducationRow,
  removeEducationRow,
  addEducationRow,
}: {
  educationRows: EducationRow[];
  updateEducationRow: (index: number, key: keyof EducationRow, value: string) => void;
  removeEducationRow: (index: number) => void;
  addEducationRow: () => void;
}) => (
  <div className="space-y-4">
    {educationRows.map((row, idx) => (
      <Card key={idx} variant="soft" className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Typography level="title-sm" textColor="#001F54">
            School Record {idx + 1}
          </Typography>
          {educationRows.length > 1 && (
            <button
              type="button"
              onClick={() => removeEducationRow(idx)}
              className="text-xs text-[#C62828]"
            >
              Remove
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="School"
            value={row.school}
            onChange={(e) => updateEducationRow(idx, "school", e.target.value)}
          />
          <Input
            label="Date"
            type="date"
            value={row.date}
            onChange={(e) => updateEducationRow(idx, "date", e.target.value)}
          />
          <Input
            label="Qualification"
            value={row.qualification}
            onChange={(e) =>
              updateEducationRow(idx, "qualification", e.target.value)
            }
          />
        </div>
      </Card>
    ))}

    <Button type="button" variant="outlined" onClick={addEducationRow}>
      Add More School
    </Button>
  </div>
);

export const EmploymentSectionView = ({
  intakeForm,
  updateNested,
}: {
  intakeForm: IntakeFormData;
  updateNested: UpdateNested;
}) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <SelectField
      label="What is your current Employment Status?"
      value={intakeForm.employmentStatus?.status || ""}
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
    <div>
      <Input
        label="Family Annual Income"
        value={intakeForm.employmentStatus?.familyAnnualIncome || ""}
        onChange={(e) =>
          updateNested("employmentStatus", "familyAnnualIncome", e.target.value)
        }
      />
      <p className="text-xs text-[#6B7280] mt-1">
        Mandatory only if applying for tuition waiver.
      </p>
    </div>
  </div>
);

export const DeclarationSectionView = ({
  intakeForm,
  updateNested,
}: {
  intakeForm: IntakeFormData;
  updateNested: UpdateNested;
}) => (
  <>
    <div className="rounded-md border border-[#D6E4FF] bg-[#F7FAFF] p-4 text-sm leading-6 text-[#001F54]">
      I hereby promise, if accepted as a student, to abide by the rules and
      regulations of the SCHOOL of DISCIPLES, to obey the Authorities of the
      school and pray for them. I also promise to fulfill all financial
      obligations and not to put a stumbling block in the way of my fellow
      students.
    </div>
    <label className="flex items-start gap-3 text-sm text-[#001F54]">
      <input
        type="checkbox"
        checked={Boolean(intakeForm.declaration?.agreed)}
        onChange={(e) => updateNested("declaration", "agreed", e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-gray-300"
      />
      <span>I agree to this declaration.</span>
    </label>
  </>
);
