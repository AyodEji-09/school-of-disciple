import { useEffect, useState } from "react";
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
import {
  parseEducationRows,
  rowsToEducationFields,
  validateStepErrors,
} from "./onboarding/helpers";
import SectionCard from "./onboarding/components/SectionCard";
import OnboardingNavbar from "./onboarding/components/OnboardingNavbar";
import StepProgressBar from "./onboarding/components/StepProgressBar";
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [intakeForm, setIntakeForm] =
    useState<IntakeFormData>(cloneIntakeForm());
  const [educationRows, setEducationRows] = useState<EducationRow[]>([
    { school: "", date: "", qualification: "" },
  ]);

  useEffect(() => {
    if (!user) return;
    const local = getLocalIntake(user._id?.toString());
    const source =
      (local?.updatedAt || 0) >= 1
        ? local?.data || user.intakeFormData
        : user.intakeFormData;
    const incoming = cloneIntakeForm(source, {
      email: user.email,
      phone: user.phone,
    });
    setIntakeForm(incoming);
    setEducationRows(parseEducationRows(incoming.educationalExperience));
    if (typeof routeStep === "string") return;
    if (typeof local?.step === "number")
      setStep(Math.max(0, Math.min(local.step, onboardingSections.length - 1)));
  }, [user]);

  useEffect(() => {
    const parsed = Number(routeStep);
    if (!Number.isFinite(parsed)) {
      navigate("/onboarding/1", { replace: true });
      return;
    }
    const index = Math.max(
      0,
      Math.min(parsed - 1, onboardingSections.length - 1),
    );
    setStep(index);
  }, [routeStep, navigate]);

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
    const errorKey = `${String(section)}.${String(key)}`;
    setFieldErrors((prev) => {
      if (!prev[errorKey]) return prev;
      const nextErrors = { ...prev };
      delete nextErrors[errorKey];
      return nextErrors;
    });
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
    const errorKey = `education.${index}.${key}`;
    setFieldErrors((prev) => {
      if (!prev[errorKey]) return prev;
      const nextErrors = { ...prev };
      delete nextErrors[errorKey];
      return nextErrors;
    });
  };

  const addEducationRow = () => {
    setEducationRows((prev) => [
      ...prev,
      { school: "", date: "", qualification: "" },
    ]);
  };

  const removeEducationRow = (index: number) => {
    setEducationRows((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      const safe = next.length
        ? next
        : [{ school: "", date: "", qualification: "" }];
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
    setFieldErrors({});
  };

  const scrollToFirstError = () => {
    setTimeout(() => {
      const firstInvalid = document.querySelector('[aria-invalid="true"]');
      firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const next = () => {
    const currentSection = onboardingSections[step];
    const errors = validateStepErrors(
      currentSection.key,
      intakeForm,
      educationRows,
    );
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      scrollToFirstError();
      return;
    }
    setFieldErrors({});
    if (step < onboardingSections.length - 1) {
      navigate(`/onboarding/${step + 2}`);
    }
  };

  const submit = async () => {
    for (let i = 0; i < onboardingSections.length; i += 1) {
      const errors = validateStepErrors(
        onboardingSections[i].key,
        intakeForm,
        educationRows,
      );
      if (Object.keys(errors).length > 0) {
        setStep(i);
        navigate(`/onboarding/${i + 1}`);
        setFieldErrors(errors);
        scrollToFirstError();
        return;
      }
    }

    if (!user?._id) return;

    setSaving(true);
    setFieldErrors({});
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
    ? "mx-auto mt-4 max-w-5xl pb-12 space-y-6"
    : "mx-auto mt-4 max-w-5xl pb-16 space-y-6 px-4 sm:px-6 lg:px-8";

  const activeSection = onboardingSections[step];
  const handleLogout = (message = "You have been logged out.") => {
    dispatch(logout());
    toast.info(message);
    navigate("/", { replace: true });
  };

  return (
    <div
      className={
        embedded
          ? "font-sans text-charcoal"
          : "min-h-screen bg-surface-container-lowest font-sans text-charcoal pt-20 sm:pt-24"
      }
    >
      {!embedded && (
        <OnboardingNavbar
          onLogout={() =>
            handleLogout(
              "Saved your draft. You can resume anytime after login.",
            )
          }
        />
      )}
      <div className={containerClass}>
        <div className="max-w-4xl mx-auto">
          <StepProgressBar steps={onboardingSections} currentStep={step} />
          <p className="text-xs sm:text-sm text-[#52525B] text-center mt-2">
            Your progress is saved automatically. You can log out and continue
            anytime.
          </p>
        </div>

        <SectionCard
          title={activeSection.title}
          subtitle={activeSection.subtitle}
        >
          {activeSection.key === "personal" && (
            <PersonalSectionView
              intakeForm={intakeForm}
              updateNested={updateNested}
              userEmail={user?.email}
              errors={fieldErrors}
            />
          )}

          {activeSection.key === "spiritual" && (
            <SpiritualSectionView
              intakeForm={intakeForm}
              updateNested={updateNested}
              errors={fieldErrors}
            />
          )}

          {activeSection.key === "education" && (
            <EducationSectionView
              educationRows={educationRows}
              updateEducationRow={updateEducationRow}
              removeEducationRow={removeEducationRow}
              addEducationRow={addEducationRow}
              errors={fieldErrors}
            />
          )}

          {activeSection.key === "employment" && (
            <EmploymentSectionView
              intakeForm={intakeForm}
              updateNested={updateNested}
              errors={fieldErrors}
            />
          )}

          {activeSection.key === "declaration" && (
            <DeclarationSectionView
              intakeForm={intakeForm}
              updateNested={updateNested}
              errors={fieldErrors}
            />
          )}
        </SectionCard>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 pb-6">
          <AppButton
            type="button"
            variant="outlined"
            onClick={() => {
              setFieldErrors({});
              if (step > 0) navigate(`/onboarding/${step}`);
            }}
            disabled={step === 0 || saving}
            className="w-full sm:w-auto h-11 px-8 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Back
          </AppButton>

          {step < onboardingSections.length - 1 ? (
            <AppButton
              type="button"
              variant="primary"
              onClick={next}
              disabled={saving}
              className="w-full sm:w-auto h-11 px-8"
            >
              Next Step
            </AppButton>
          ) : (
            <AppButton
              type="button"
              variant="gold"
              onClick={submit}
              loading={saving}
              disabled={saving}
              className="w-full sm:w-auto h-11 px-8"
            >
              Submit Application
            </AppButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
