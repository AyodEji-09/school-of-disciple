import { Controller, useForm } from "react-hook-form";
import Input from "../components/input/input.component";
import { Button } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { handleError } from "../utils";
import Hero from "../components/hero/Hero";
import { Stack, Typography } from "@mui/joy";
import { useGetAllCenterQuery } from "../data/rtk/center";
import SearchableSelect from "../components/input/SearchableSelect";
import { useGetRegistrationWindowQuery } from "../data/rtk/registration";
import { useNavigate, Link } from "react-router-dom";
import UseBox from "../components/usebox/UseBox";
import AppModal from "../components/modal/modal";
import OtpComponent from "../components/otp-component/OtpComponent";
import { useAppDispatch } from "../data/hooks";
import { login } from "../data/reducers/userSlice";
import Onboarding from "./Onboarding";
import { hasCompletedIntake } from "../utils/intake";
const getRegistrationWindowState = (
  window?: RegistrationWindow | null,
): {
  status: "open" | "closed" | "not-configured";
  message: string;
} => {
  if (!window) {
    return {
      status: "not-configured",
      message:
        "Registration has not been announced yet. Please check back soon.",
    };
  }

  if (Date.now() < new Date(window.startDate).getTime()) {
    return {
      status: "closed",
      message: `Registration opens on ${new Date(window.startDate).toLocaleDateString()}.`,
    };
  }

  if (Date.now() > new Date(window.endDate).getTime()) {
    return {
      status: "closed",
      message: "Registration window is now closed.",
    };
  }

  return {
    status: "open",
    message: "",
  };
};

type Form = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  centerId: string;
  password: string;
};

const getUserDestination = (user?: User | null) => {
  if (!user || user.type !== "user") return "/dashboard";
  const completed = hasCompletedIntake(user);
  return completed ? "/my-dashboard" : "/onboarding/1";
};
const Register = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingCredentials, setPendingCredentials] = useState<Pick<
    Form,
    "email" | "password"
  > | null>(null);
  const [showStepper, setShowStepper] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  const { data: centers } = useGetAllCenterQuery();
  const { data: registrationWindowRes, isLoading: registrationWindowLoading } =
    useGetRegistrationWindowQuery();
  const registrationWindow = registrationWindowRes?.data;
  const registrationWindowState =
    getRegistrationWindowState(registrationWindow);
  const canRegisterNow = registrationWindowState.status === "open";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      centerId: "",
      password: "",
    },
  });

  const sendVerificationOtp = async (email: string) => {
    await axios.post("/auth/request-token", {
      email,
      type: "verifyEmail",
    });
  };

  const performLogin = async (
    credentials: Pick<Form, "email" | "password">,
    skipRedirect?: boolean,
  ) => {
    const res = await axios.post("/auth/login", credentials);
    dispatch(login(res.data.data));
    if (!skipRedirect) {
      navigate(getUserDestination(res.data.data.user), { replace: true });
    }
  };

  const onSubmit = async (data: Form) => {
    if (registrationWindowLoading) {
      toast.info("Checking registration window, please wait...");
      return;
    }

    const currentWindowState = getRegistrationWindowState(registrationWindow);
    if (currentWindowState.status !== "open") {
      toast.error(currentWindowState.message);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post<ApiResponseN<null>>(
        "/auth/register",
        data,
      );
      toast.success(res.data.message);

      const credentials = {
        email: data.email,
        password: data.password,
      };
      setPendingCredentials(credentials);

      try {
        await sendVerificationOtp(data.email);
        setIsModalOpen(true);
        toast.info("A verification code has been sent to your email");
        setCountdown(60);
      } catch (otpError) {
        toast.error(handleError(otpError));
      }
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length < 6) {
      return toast.error("Please enter the complete 6-digit code");
    }

    if (!pendingCredentials?.email || !pendingCredentials?.password) {
      return toast.error("Missing signup session. Please register again.");
    }

    setVerifyLoading(true);
    try {
      await axios.post("/auth/verify-Email", {
        token: otp,
        email: pendingCredentials.email,
      });
      toast.success("Email verified! Continue to complete registration form.");
      setIsModalOpen(false);
      // login but don't redirect — show the stepper so user completes registration
      await performLogin(pendingCredentials, true);
      setShowStepper(true);
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setVerifyLoading(false);
    }
  };

  const resendOtp = async () => {
    const email = pendingCredentials?.email;
    if (!email)
      return toast.error("Missing signup session. Please register again.");

    setResendLoading(true);
    try {
      await sendVerificationOtp(email);
      toast.success("Verification code resent");
      setCountdown(60);
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] bg-surface-container-lowest text-charcoal">
      {!showStepper ? (
        <UseBox img="https://lh3.googleusercontent.com/aida-public/AB6AXuCWn-hGcxJUAwowmagapU2vRCmt3lf4DlP77ttjiVuC4JZ4oS1LPULYM0SGioIG-93R6YXsSXqAotfcCakU50hkzcndnunIbrQFzXy8npISY7Hh4QpKozMiFpC2wj-NFYD0oS9D5iHOUEMpU-QKbjc8AhOzZw2JPsWJjj3bahoCOQj_D7yyScaWB1Gcz-nXMQuIh_gDKZ9HFr6ZgfJPZZQjZIaO9CVDxx0-V95_hgw">
          <div className="mb-8">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
              Register for School of Disciples
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">
              Complete your registration and make payment for SOD
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Controller
                  name="firstName"
                  control={control}
                  rules={{
                    required: "This field is required",
                  }}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      label="First Name"
                      placeholder="e.g. Samuel"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                {errors.firstName && (
                  <p className="text-xs text-error mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Controller
                  name="lastName"
                  control={control}
                  rules={{
                    required: "This field is required",
                  }}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      label="Last Name"
                      placeholder="e.g. Adebayo"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                {errors.lastName && (
                  <p className="text-xs text-error mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "This field is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email format",
                  },
                }}
                render={({ field: { value, onChange } }) => (
                  <Input
                    label="Email Address"
                    placeholder="disciple@example.com"
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
              {errors.email && (
                <p className="text-xs text-error mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: "This field is required",
                }}
                render={({ field: { value, onChange } }) => (
                  <Input
                    label="Phone Number"
                    placeholder="+1 (555) 000-0000"
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
              {errors.phone && (
                <p className="text-xs text-error mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="center-select"
                className="font-label-md text-label-md font-medium text-charcoal"
              >
                Center
              </label>
              <Controller
                name="centerId"
                control={control}
                rules={{
                  required: "Please select a center",
                }}
                render={({ field: { value, onChange } }) => (
                  <SearchableSelect
                    size="md"
                    value={value}
                    onChange={(val) => onChange(val)}
                    placeholder="Select your regional training center"
                    className="h-12"
                    sx={{
                      borderRadius: "10px",
                      borderColor: "#E4E1DA",
                      backgroundColor: "#FFFFFF",
                      fontFamily: '"DM Sans", sans-serif',
                      color: "#2B2F3A",
                      minHeight: "48px",
                      "--Input-focusedHighlight": "#1B2A5C",
                    }}
                    options={
                      centers?.data?.docs?.map((item) => ({
                        value: item._id,
                        label: item.name,
                      })) ?? []
                    }
                  />
                )}
              />
              {errors.centerId && (
                <p className="text-error text-xs mt-1">
                  This field is required.
                </p>
              )}
            </div>

            <div>
              <Controller
                name="password"
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { value, onChange } }) => (
                  <Input
                    label="Create Password"
                    type="password"
                    placeholder="••••••••••••"
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
              {errors.password && (
                <p className="text-error text-xs mt-1">
                  This field is required.
                </p>
              )}
            </div>

            {registrationWindowState.status !== "open" && (
              <div className="pt-2">
                <div className="bg-coolgray border border-mist rounded-input p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-outline text-xl shrink-0 mt-0.5">
                    info
                  </span>
                  <p className="font-sans text-sm leading-relaxed text-charcoal">
                    <span className="font-semibold text-navy">
                      {registrationWindowState.message}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button
                variant="contained"
                type="submit"
                loading={loading}
                disabled={
                  loading || registrationWindowLoading || !canRegisterNow
                }
                fullWidth
                sx={{
                  height: "48px",
                  borderRadius: "9999px",
                  backgroundColor: "#1B2A5C",
                  color: "#FFFFFF",
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  boxShadow: "0 4px 20px rgba(27, 42, 92, 0.08)",
                  "&:hover": {
                    backgroundColor: "#131F43",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "#E4E1DA",
                    color: "#767680",
                  },
                }}
              >
                Submit
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center font-body-sm text-body-sm text-on-surface-variant">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary ml-1 transition-all underline decoration-gold decoration-2 underline-offset-4 hover:text-gold"
            >
              Login
            </Link>
          </p>
        </UseBox>
      ) : (
        <>
          <Hero
            title="Register for School of Disciples"
            subtitle="Complete your registration and make payment for SOD"
          />
          <div className="container mx-auto py-16 px-4 md:px-0">
            <div className="max-w-4xl mx-auto">
              <Onboarding embedded />
            </div>
          </div>
        </>
      )}

      <AppModal
        isOpen={isModalOpen}
        close={() => setIsModalOpen(false)}
        title="Verify Your Email"
        icon
      >
        <div className="w-[min(360px,80vw)] mt-2 space-y-5 font-sans">
          <Typography
            level="body-sm"
            sx={{ fontFamily: '"DM Sans", sans-serif', color: "#45464f" }}
          >
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold text-navy">
              {pendingCredentials?.email}
            </span>
          </Typography>

          <div className="flex justify-center py-2">
            <OtpComponent onChange={setOtp} loading={verifyLoading} />
          </div>

          <p className="text-xs text-center text-on-surface-variant">
            Didn&apos;t get the code?{" "}
            <button
              type="button"
              onClick={resendOtp}
              disabled={resendLoading || countdown > 0}
              className="font-semibold text-navy hover:text-gold underline decoration-gold underline-offset-4 disabled:opacity-50 cursor-pointer"
            >
              {resendLoading
                ? "Sending..."
                : countdown > 0
                  ? `Resend in ${countdown}s`
                  : "Resend"}
            </button>
          </p>

          <Stack direction="row" gap={2}>
            <Button
              variant="contained"
              type="button"
              onClick={verifyOtp}
              disabled={verifyLoading}
              fullWidth
              sx={{
                height: "44px",
                borderRadius: "9999px",
                backgroundColor: "#1B2A5C",
                fontFamily: '"DM Sans", sans-serif',
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { backgroundColor: "#131F43" },
              }}
            >
              {verifyLoading ? "Verifying..." : "Verify & Log In"}
            </Button>
            <Button
              variant="outlined"
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={verifyLoading}
              fullWidth
              sx={{
                height: "44px",
                borderRadius: "9999px",
                borderColor: "#1B2A5C",
                color: "#1B2A5C",
                fontFamily: '"DM Sans", sans-serif',
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
          </Stack>
        </div>
      </AppModal>
    </div>
  );
};

export default Register;
