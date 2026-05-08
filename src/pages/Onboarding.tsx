import { useEffect, useMemo, useState } from "react";
import { Card, Chip, Typography } from "@mui/joy";
import { Button, LinearProgress } from "@mui/material";
import { toast } from "react-toastify";
import AppButton from "../components/Button/AppButton";
import { handleError } from "../utils";
import { useAppDispatch, useAppSelector } from "../data/hooks";
import { login, logout } from "../data/reducers/userSlice";
import { selectUser } from "../data/selectors/authSelector";
import {
  calculateProgress,
  cloneIntakeForm,
  getLocalIntake,
  saveLocalIntake,
} from "../utils/intake";
import type { IntakeFormData } from "../utils/intake";
import { useUpdateUserMutation } from "../data/rtk/user";
import { useNavigate, useParams } from "react-router-dom";
import { onboardingSections, type EducationRow } from "./onboarding/config";
import { parseEducationRows, rowsToEducationFields, validateStep } from "./onboarding/helpers";
import SectionCard from "./onboarding/components/SectionCard";
import {
  DeclarationSectionView,
  EducationSectionView,
  EmploymentSectionView,
  PersonalSectionView,
  SpiritualSectionView,
} from "./onboarding/components/SectionViews";

const Onboarding = ({ embedded = false }: { embedded?: boolean }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { step: routeStep } = useParams();
  const user = useAppSelector(selectUser);
  const [updateUser] = useUpdateUserMutation();
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState("");
  const [intakeForm, setIntakeForm] = useState<IntakeFormData>(cloneIntakeForm());
  const [educationRows, setEducationRows] = useState<EducationRow[]>([
    { school: "", date: "", qualification: "" },
  ]);

  useEffect(() => {
    if (!user) return;
    const local = getLocalIntake(user._id?.toString());
    const source =
      (local?.updatedAt || 0) >= 1 ? local?.data || user.intakeFormData : user.intakeFormData;
    const incoming = cloneIntakeForm(source, {
      email: user.email,
      phone: user.phone,
    });
    setIntakeForm(incoming);
    setEducationRows(parseEducationRows(incoming.educationalExperience));
    if (typeof routeStep === "string") return;
    if (typeof local?.step === "number") setStep(Math.max(0, Math.min(local.step, onboardingSections.length - 1)));
  }, [user]);

  useEffect(() => {
    const parsed = Number(routeStep);
    if (!Number.isFinite(parsed)) {
      navigate("/onboarding/1", { replace: true });
      return;
    }
    const index = Math.max(0, Math.min(parsed - 1, onboardingSections.length - 1));
    setStep(index);
  }, [routeStep, navigate]);

  const progress = useMemo(() => calculateProgress(intakeForm), [intakeForm]);

  useEffect(() => {
    if (!user?._id) return;
    const timer = setTimeout(() => {
      saveLocalIntake(user._id?.toString(), intakeForm, { step });
    }, 350);
    return () => clearTimeout(timer);
  }, [intakeForm, step, user?._id]);

  const updateNested = <
    T extends keyof IntakeFormData,
    K extends keyof NonNullable<IntakeFormData[T]>,
  >(
    section: T,
    key: K,
    value: NonNullable<IntakeFormData[T]>[K],
  ) => {
    setIntakeForm((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [key]: value,
      },
    }));
  };

  const updateEducationRow = (
    index: number,
    key: keyof EducationRow,
    value: string,
  ) => {
    setEducationRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      const serialized = rowsToEducationFields(next);
      setIntakeForm((form) => ({
        ...form,
        educationalExperience: {
          ...(form.educationalExperience || {}),
          ...serialized,
        },
      }));
      return next;
    });
  };

  const addEducationRow = () => {
    setEducationRows((prev) => [...prev, { school: "", date: "", qualification: "" }]);
  };

  const removeEducationRow = (index: number) => {
    setEducationRows((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      const safe = next.length ? next : [{ school: "", date: "", qualification: "" }];
      const serialized = rowsToEducationFields(safe);
      setIntakeForm((form) => ({
        ...form,
        educationalExperience: {
          ...(form.educationalExperience || {}),
          ...serialized,
        },
      }));
      return safe;
    });
  };

  const next = () => {
    const currentSection = onboardingSections[step];
    const missing = validateStep(currentSection.key, intakeForm, educationRows);
    if (missing.length) {
      setStepError(
        `Please complete: ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? " ..." : ""}`,
      );
      return;
    }
    setStepError("");
    if (step < onboardingSections.length - 1) {
      navigate(`/onboarding/${step + 2}`);
    }
  };

  const submit = async () => {
    for (let i = 0; i < onboardingSections.length; i += 1) {
      const missing = validateStep(onboardingSections[i].key, intakeForm, educationRows);
      if (missing.length) {
        setStep(i);
        navigate(`/onboarding/${i + 1}`);
        setStepError(
          `Please complete: ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? " ..." : ""}`,
        );
        return;
      }
    }

    if (!user?._id) return;

    setSaving(true);
    setStepError("");
    try {
      const computedProgress = calculateProgress(intakeForm);
      const isComplete = computedProgress >= 100;
      saveLocalIntake(user._id?.toString(), intakeForm, { step });

      const res = await updateUser({
        id: user._id,
        body: {
          intakeFormData: intakeForm,
          intakeFormProgress: computedProgress,
          intakeFormStatus: isComplete ? "completed" : "in_progress",
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        },
      }).unwrap();

      if (res?.data) {
        dispatch(login({ user: res.data }));
        if (isComplete) {
          toast.success("Registration form submitted successfully");
          navigate("/my-dashboard", { replace: true });
        } else {
          toast.error("Form is incomplete. Please complete all sections.");
        }
      }
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setSaving(false);
    }
  };

  const containerClass = embedded
    ? "mx-auto mt-6 max-w-6xl pb-16 space-y-6"
    : "mx-auto mt-6 max-w-6xl pb-16 space-y-6 px-4";

  const activeSection = onboardingSections[step];
  const handleLogout = (message = "You have been logged out.") => {
    dispatch(logout());
    toast.info(message);
    navigate("/", { replace: true });
  };

  return (
    <div className={embedded ? "" : "min-h-screen bg-[#F5FAFF] pt-6"}>
      <div className={containerClass}>
        <Card variant="outlined">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Typography level="title-lg" textColor="#001F54">
                Admission Intake
              </Typography>
              <Typography level="body-sm" textColor="#6B7280">
                Complete all sections before proceeding to payment and dashboard access.
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <Chip color={progress >= 100 ? "success" : "warning"} variant="soft">
                {progress}% complete
              </Chip>
              <Button
                type="button"
                variant="outlined"
                onClick={() => handleLogout("Saved your draft. You can resume anytime after login.")}
              >
                Logout
              </Button>
            </div>
          </div>
        </Card>

        <Card variant="outlined">
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 2, mb: 2 }}
          />
          <div className="flex flex-wrap gap-2 items-center">
            {onboardingSections.map((section, index) => (
              <button
                key={section.key}
                type="button"
                onClick={() => navigate(`/onboarding/${index + 1}`)}
                className={`px-3 py-1 rounded text-sm ${
                  index === step ? "bg-[#001EC5] text-white" : "bg-gray-100 text-[#001F54]"
                }`}
              >
                {index + 1}. {section.title.replace(/^Section\s\d+:\s/, "")}
              </button>
            ))}
          </div>
        </Card>

        <SectionCard title={activeSection.title} subtitle={activeSection.subtitle}>
          {activeSection.key === "personal" && (
            <PersonalSectionView
              intakeForm={intakeForm}
              updateNested={updateNested}
              userEmail={user?.email}
            />
          )}

          {activeSection.key === "spiritual" && (
            <SpiritualSectionView intakeForm={intakeForm} updateNested={updateNested} />
          )}

          {activeSection.key === "education" && (
            <EducationSectionView
              educationRows={educationRows}
              updateEducationRow={updateEducationRow}
              removeEducationRow={removeEducationRow}
              addEducationRow={addEducationRow}
            />
          )}

          {activeSection.key === "employment" && (
            <EmploymentSectionView intakeForm={intakeForm} updateNested={updateNested} />
          )}

          {activeSection.key === "declaration" && (
            <DeclarationSectionView intakeForm={intakeForm} updateNested={updateNested} />
          )}
        </SectionCard>

        {stepError && <p className="text-sm text-[#C62828]">{stepError}</p>}

        <div className="flex gap-3 mt-2 pb-6">
          <Button
            type="button"
            variant="outlined"
            onClick={() => {
              setStepError("");
              if (step > 0) navigate(`/onboarding/${step}`);
            }}
            disabled={step === 0 || saving}
          >
            Back
          </Button>

          {step < onboardingSections.length - 1 ? (
            <Button type="button" variant="contained" onClick={next} disabled={saving}>
              Next
            </Button>
          ) : (
            <AppButton type="button" onClick={submit} loading={saving} disabled={saving}>
              Submit
            </AppButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
