import { Controller, useForm } from "react-hook-form";
import Input from "../components/input/input.component";
import { Button } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { handleError } from "../utils";
import Hero from "../components/hero/Hero";
import { Option, Select, Stack, Typography } from "@mui/joy";
import { useGetAllCenterQuery } from "../data/rtk/center";
import { useGetRegistrationWindowQuery } from "../data/rtk/registration";
import { useNavigate } from "react-router-dom";
import AppModal from "../components/modal/modal";
import OtpComponent from "../components/otp-component/OtpComponent";
import { useAppDispatch } from "../data/hooks";
import { login } from "../data/reducers/userSlice";
import Onboarding from "./Onboarding";
import { hasCompletedIntake } from "../utils/intake";
import { titleCaseName } from "../utils";

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

    const normalizedData = {
      ...data,
      firstName: titleCaseName(data.firstName),
      lastName: titleCaseName(data.lastName),
    };

    setLoading(true);
    try {
      const res = await axios.post<ApiResponseN<null>>("/auth/register", normalizedData);
      toast.success(res.data.message);

      const credentials = {
        email: normalizedData.email,
        password: normalizedData.password,
      };
      setPendingCredentials(credentials);

      try {
        await sendVerificationOtp(normalizedData.email);
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
    <div>
      <Hero
        title="Register for School of Disciples"
        subtitle="Kindly complete your registration and make payment for SOD"
      />
      <div className="container mx-auto py-16 px-4 md:px-0">
        {!showStepper ? (
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto">
            <div className="grid gap-4">
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
                      value={value}
                      onChange={onChange}
                      onBlur={(e) =>
                        onChange(titleCaseName(e.target.value || value))
                      }
                    />
                  )}
                />
                {errors.firstName && (
                  <p className="text-xs text-[#dc2626]">
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
                      value={value}
                      onChange={onChange}
                      onBlur={(e) =>
                        onChange(titleCaseName(e.target.value || value))
                      }
                    />
                  )}
                />
                {errors.lastName && (
                  <p className="text-xs text-[#dc2626]">
                    {errors.lastName.message}
                  </p>
                )}
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
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-xs text-[#dc2626]">
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
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                {errors.phone && (
                  <p className="text-xs text-[#dc2626]">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="">Center</label>
                <Controller
                  name="centerId"
                  control={control}
                  rules={{
                    required: "Please select a center",
                  }}
                  render={({ field: { onChange } }) => (
                    <Select
                      onChange={(_, value) => onChange(value)}
                      className="h-12"
                    >
                      {centers?.data.docs.length ? (
                        centers?.data?.docs?.map((item) => (
                          <Option key={item._id} value={item._id}>
                            {item.name}
                          </Option>
                        ))
                      ) : (
                        <Option value={"mm"}>No Data</Option>
                      )}
                    </Select>
                  )}
                />
                {errors.centerId && (
                  <p className="text-[#dc2626] text-xs">
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
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                {errors.password && (
                  <p className="text-[#dc2626] text-xs">
                    This field is required.
                  </p>
                )}
              </div>
            </div>
            {registrationWindowState.status !== "open" && (
              <p className="text-xs text-[#6B7280]">
                {registrationWindowState.message}
              </p>
            )}
            <div className="flex items-center mt-8">
              <Button
                variant="contained"
                type="submit"
                loading={loading}
                disabled={
                  loading || registrationWindowLoading || !canRegisterNow
                }
                fullWidth
              >
                Submit
              </Button>
            </div>
          </form>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Onboarding embedded />
          </div>
        )}
      </div>

      <AppModal
        isOpen={isModalOpen}
        close={() => setIsModalOpen(false)}
        title="Verify Your Email"
        icon
      >
        <div className="w-[min(360px,80vw)] mt-2 space-y-5">
          <Typography level="body-sm" textColor="#6B7280">
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold text-[#001F54]">
              {pendingCredentials?.email}
            </span>
          </Typography>

          <div className="flex justify-center py-2">
            <OtpComponent onChange={setOtp} loading={verifyLoading} />
          </div>

          <p className="text-xs text-center text-[#6B7280]">
            Didn't get the code?{" "}
            <button
              type="button"
              onClick={resendOtp}
              disabled={resendLoading || countdown > 0}
              className="font-semibold text-[#001EC5] hover:underline disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend"}
            </button>
          </p>

          <Stack direction="row" gap={2}>
            <Button
              variant="contained"
              type="button"
              onClick={verifyOtp}
              disabled={verifyLoading}
              fullWidth
            >
              {verifyLoading ? "Verifying..." : "Verify & Log In"}
            </Button>
            <Button
              variant="outlined"
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={verifyLoading}
              fullWidth
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
