import { useState } from "react";
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
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <UseBox img="login-bg.png">
      <Stack mt={8}>
        <Typography level="h2">Login</Typography>

        <form className="mt-10" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
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
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
              {errors.email && (
                <p className="text-[#dc2626] text-xs mt-1">
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
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
              {errors.password && (
                <p className="text-[#dc2626] text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="col-span-2 px-2">
              <Box
                color="#000817"
                justifyContent="space-between"
                display="flex"
                alignItems="center"
              >
                <Checkbox label="Remember Me" sx={{ fontSize: 14 }} />
                <Typography
                  component={Link}
                  to="/forgot-password"
                  level="body-xs"
                  textColor="#404757"
                  sx={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  Forgot Password?
                </Typography>
              </Box>
            </div>
          </div>

          <Stack mt={6}>
            <AppButton loading={loginLoading} disabled={loginLoading}>
              Log In
            </AppButton>
          </Stack>
        </form>

        <Typography level="body-xs" textAlign="center" mt={2}>
          Don't have an account?{" "}
          <Link to="/register" className="font-bold underline">
            Register
          </Link>
        </Typography>
      </Stack>

      {/* ── Email verification modal ──────────────────────────────────────── */}
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
              {getValues().email}
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
              disabled={resendLoading}
              className="font-semibold text-[#001EC5] hover:underline disabled:opacity-50"
            >
              {resendLoading ? "Sending…" : "Resend"}
            </button>
          </p>

          <Stack direction="row" gap={2}>
            <AppButton
              type="button"
              loading={verifyLoading}
              disabled={verifyLoading}
              onClick={verifyOtp}
            >
              Verify &amp; Log In
            </AppButton>
            <AppButton
              type="button"
              variant="outlined"
              onClick={() => setIsModalOpen(false)}
              disabled={verifyLoading}
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
