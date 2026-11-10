import { useState, useEffect } from "react";
import UseBox from "../components/usebox/UseBox";
import { Box, Checkbox, Stack, Typography } from "@mui/joy";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import AppButton from "../components/Button/AppButton";
import { toast } from "react-toastify";
import axios from "axios";
import { handleError } from "../utils";
import AppModal from "../components/modal/modal";
import { useAppDispatch } from "../data/hooks";
import { login } from "../data/reducers/userSlice";
import Input from "../components/input/input.component";
import OtpComponent from "../components/otp-component/OtpComponent";
import { hasCompletedIntake } from "../utils/intake";

interface FormType {
  email: string;
  password: string;
}

const getUserDestination = (user?: User | null) => {
  if (!user || user.type !== "user") return "/dashboard";
  const completed = hasCompletedIntake(user);
  return completed ? "/my-dashboard" : "/onboarding/1";
};

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [loginLoading, setLoginLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormType>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const sendVerificationOtp = async (email: string) => {
    await axios.post("/auth/request-token", {
      email,
      type: "verifyEmail",
    });
  };

  const performLogin = async (data: FormType) => {
    const res = await axios.post("/auth/login", data);
    toast.success(res.data.message);
    dispatch(login(res.data.data));
    navigate(getUserDestination(res.data.data.user), { replace: true });
  };

  const onSubmit = async (data: FormType) => {
    setLoginLoading(true);
    try {
      await performLogin(data);
    } catch (error) {
      // 402 = email not yet verified — send OTP and open the modal
      if (axios.isAxiosError(error) && error.response?.status === 402) {
        try {
          await sendVerificationOtp(data.email);
          setIsModalOpen(true);
          toast.info("A verification code has been sent to your email");
        } catch (otpError) {
          toast.error(handleError(otpError));
        }
      } else {
        toast.error(handleError(error));
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length < 6) {
      return toast.error("Please enter the complete 6-digit code");
    }
    setVerifyLoading(true);
    try {
      await axios.post("/auth/verify-Email", {
        token: otp,
        email: getValues().email,
      });
      toast.success("Email verified! Logging you in…");
      setIsModalOpen(false);
      // Automatically log them in now that the email is verified
      await performLogin(getValues());
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setVerifyLoading(false);
    }
  };

  const resendOtp = async () => {
    setResendLoading(true);
    try {
      await sendVerificationOtp(getValues().email);
      toast.success("Verification code resent");
      setCountdown(60);
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <UseBox img="manholding.jpg">
      <Stack className="scrollbar-hide">
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
          Login
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">
          Sign in to access your student portal and coursework
        </p>

        <form
          className="mt-8 flex flex-col"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
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
                    placeholder="e.g. disciple@rccgnasod.org"
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
              {errors.email && (
                <p className="text-error text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <Controller
                name="password"
                control={control}
                rules={{ required: "This field is required" }}
                render={({ field: { value, onChange } }) => (
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••••••"
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
              {errors.password && (
                <p className="text-error text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <Box
                justifyContent="space-between"
                display="flex"
                alignItems="center"
                className="mt-1 mb-2"
              >
                <Checkbox
                  label="Remember Me"
                  sx={{
                    fontSize: 14,
                    fontFamily: '"DM Sans", sans-serif',
                    color: "#45464f",
                  }}
                />
                <Typography
                  component={Link}
                  to="/forgot-password"
                  level="body-xs"
                  sx={{
                    cursor: "pointer",
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#021447",
                    "&:hover": { color: "#C99A2E", textDecoration: "underline" },
                  }}
                >
                  Forgot Password?
                </Typography>
              </Box>
            </div>
          </div>

          <Stack mt={4}>
            <AppButton
              loading={loginLoading}
              disabled={loginLoading}
              className="w-full! h-12! rounded-full! bg-primary-container! hover:bg-primary! text-on-primary! font-label-lg! text-label-lg! font-medium! shadow-ambient! transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Log In</span>
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </AppButton>
          </Stack>
        </form>

        <p className="mt-8 text-center font-body-sm text-body-sm text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-primary ml-1 transition-all underline decoration-gold decoration-2 underline-offset-4 hover:text-gold"
          >
            Register
          </Link>
        </p>
      </Stack>

      {/* ── Email verification modal ──────────────────────────────────────── */}
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
              {getValues().email}
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
                ? "Sending…"
                : countdown > 0
                  ? `Resend in ${countdown}s`
                  : "Resend"}
            </button>
          </p>

          <Stack direction="row" gap={2}>
            <AppButton
              type="button"
              loading={verifyLoading}
              disabled={verifyLoading}
              onClick={verifyOtp}
              className="flex-1! h-11! rounded-full! bg-navy! hover:bg-navy-light! text-on-primary! cursor-pointer"
            >
              Verify
            </AppButton>
            <AppButton
              type="button"
              variant="outlined"
              onClick={() => setIsModalOpen(false)}
              disabled={verifyLoading}
              className="flex-1! h-11! rounded-full! border-navy! text-navy! hover:bg-coolgray! cursor-pointer"
            >
              Cancel
            </AppButton>
          </Stack>
        </div>
      </AppModal>
    </UseBox>
  );
};

export default Login;
