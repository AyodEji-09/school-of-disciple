import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Stack, Typography } from "@mui/joy";
import { toast } from "react-toastify";
import axios from "axios";

import UseBox from "../components/usebox/UseBox";
import Input from "../components/input/input.component";
import AppButton from "../components/Button/AppButton";
import OtpComponent from "../components/otp-component/OtpComponent";
import AppModal from "../components/modal/modal";
import { handleError } from "../utils";

type RequestTokenForm = {
  email: string;
};

type ResetPasswordForm = {
  password: string;
  confirmPassword: string;
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [hasRequestedToken, setHasRequestedToken] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [requestingToken, setRequestingToken] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingToken, setResendingToken] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const {
    control: emailControl,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
    getValues: getEmailValues,
  } = useForm<RequestTokenForm>({
    defaultValues: {
      email: "",
    },
  });

  const {
    control: resetControl,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordForm>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const requestResetToken = async (value: string) => {
    await axios.post("/auth/request-token", {
      email: value,
      type: "resetPassword",
    });
  };

  const onRequestToken = async ({ email: formEmail }: RequestTokenForm) => {
    setRequestingToken(true);
    try {
      await requestResetToken(formEmail);
      setEmail(formEmail);
      setHasRequestedToken(true);
      setOtpVerified(false);
      setOtp("");
      setIsOtpModalOpen(true);
      toast.success("A reset code has been sent to your email");
      setCountdown(60);
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setRequestingToken(false);
    }
  };

  const onResendToken = async () => {
    const formEmail = email || getEmailValues().email;
    if (!formEmail) {
      toast.error("Enter your email first");
      return;
    }

    setResendingToken(true);
    try {
      await requestResetToken(formEmail);
      setIsOtpModalOpen(true);
      toast.success("Reset code resent");
      setCountdown(60);
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setResendingToken(false);
    }
  };

  const verifyOtp = async () => {
    if (!hasRequestedToken) {
      toast.error("Request a reset code first");
      return;
    }

    if (!otp || otp.length < 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setVerifyingOtp(true);
    try {
      // Backend verifies reset token during password reset.
      setOtpVerified(true);
      setIsOtpModalOpen(false);
      toast.success("Code verified. You can now set a new password.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const onResetPassword = async ({
    password,
    confirmPassword,
  }: ResetPasswordForm) => {
    if (!hasRequestedToken) {
      toast.error("Request a reset code first");
      return;
    }

    if (!otpVerified) {
      toast.error("Verify your reset code first");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setResettingPassword(true);
    try {
      await axios.post("/auth/reset-password", {
        email,
        token: otp,
        password,
      });
      toast.success("Password reset successful. You can now log in.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <UseBox img="manholding.jpg">
      <Stack className="scrollbar-hide">
        <div className="w-full bg-surface-container-lowest rounded-xl p-6 sm:p-8 shadow-ambient border border-mist flex flex-col">
          <div className="mb-5">
            {!hasRequestedToken ? (
              <svg
                aria-hidden="true"
                className="w-11 h-11 text-gold"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                viewBox="0 0 48 48"
              >
                <circle cx="19" cy="20" r="10" />
                <path d="M26.5 27.5L41 42" />
                <path d="M34 35L38.5 39.5" />
                <path d="M38 31L42.5 35.5" />
              </svg>
            ) : !otpVerified ? (
              <svg
                aria-hidden="true"
                className="w-11 h-11 text-gold"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                viewBox="0 0 48 48"
              >
                <rect x="8" y="10" width="32" height="28" rx="4" />
                <path d="M8 16L24 26L40 16" />
                <circle cx="24" cy="24" r="3" fill="currentColor" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                className="w-11 h-11 text-gold"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                viewBox="0 0 48 48"
              >
                <rect x="10" y="18" width="28" height="24" rx="4" />
                <path d="M16 18V12C16 7.58 19.58 4 24 4C28.42 4 32 7.58 32 12V18" />
                <circle cx="24" cy="29" r="3" />
                <path d="M24 32V36" />
              </svg>
            )}
          </div>

          <h1 className="font-headline-lg text-headline-sm sm:text-headline-md text-primary font-semibold tracking-tight">
            {!hasRequestedToken
              ? "Forgot Password?"
              : !otpVerified
                ? "Enter Verification Code"
                : "Set New Password"}
          </h1>
          <p className="font-body-md text-body-sm sm:text-body-md text-on-surface-variant mt-2 leading-relaxed">
            {otpVerified
              ? `Create a new password for ${email}`
              : hasRequestedToken
                ? `Enter the 6-digit verification code sent to ${email}`
                : "Enter your email and we will send a reset code."}
          </p>

          {!hasRequestedToken && (
            <form
              className="mt-6 space-y-5"
              onSubmit={handleEmailSubmit(onRequestToken)}
            >
              <div>
                <Controller
                  name="email"
                  control={emailControl}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email format",
                    },
                  }}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      label="Email Address"
                      placeholder="disciple@rccgnasod.org"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                {emailErrors.email && (
                  <p className="text-error text-xs mt-1">
                    {emailErrors.email.message}
                  </p>
                )}
              </div>

              <Stack>
                <AppButton
                  loading={requestingToken}
                  disabled={requestingToken}
                  className="w-full! h-12! rounded-full! bg-primary! hover:bg-primary-container! text-on-primary! font-label-lg! text-label-lg! font-medium! tracking-wide! transition-all shadow-ambient! flex items-center justify-center cursor-pointer"
                >
                  Send Reset Code
                </AppButton>
              </Stack>
            </form>
          )}

          {hasRequestedToken && !otpVerified && (
            <div className="mt-6 space-y-4">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Enter the code sent to{" "}
                <b className="text-primary">{email}</b> to continue.
              </p>
              <Stack direction="row" gap={2}>
                <AppButton
                  type="button"
                  onClick={() => setIsOtpModalOpen(true)}
                  className="flex-1! h-12! rounded-full! bg-primary! hover:bg-primary-container! text-on-primary! font-label-lg! shadow-ambient! cursor-pointer"
                >
                  Enter Code
                </AppButton>
                <AppButton
                  type="button"
                  variant="outlined"
                  onClick={onResendToken}
                  disabled={resendingToken || countdown > 0}
                  className="flex-1! h-12! rounded-full! border-navy! text-navy! hover:bg-coolgray! font-label-lg! cursor-pointer"
                >
                  {resendingToken
                    ? "Sending..."
                    : countdown > 0
                      ? `Resend in ${countdown}s`
                      : "Resend Code"}
                </AppButton>
              </Stack>
            </div>
          )}

          {hasRequestedToken && otpVerified && (
            <form
              className="mt-6 space-y-4"
              onSubmit={handleResetSubmit(onResetPassword)}
            >
              <div>
                <Controller
                  name="password"
                  control={resetControl}
                  rules={{ required: "New password is required" }}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      label="New Password"
                      type="password"
                      placeholder="••••••••••••"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                {resetErrors.password && (
                  <p className="text-error text-xs mt-1">
                    {resetErrors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Controller
                  name="confirmPassword"
                  control={resetControl}
                  rules={{ required: "Confirm your password" }}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      label="Confirm Password"
                      type="password"
                      placeholder="••••••••••••"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                {resetErrors.confirmPassword && (
                  <p className="text-error text-xs mt-1">
                    {resetErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Stack mt={2}>
                <AppButton
                  loading={resettingPassword}
                  disabled={resettingPassword}
                  className="w-full! h-12! rounded-full! bg-primary! hover:bg-primary-container! text-on-primary! font-label-lg! text-label-lg! font-medium! tracking-wide! transition-all shadow-ambient! flex items-center justify-center cursor-pointer"
                >
                  Reset Password
                </AppButton>
              </Stack>
            </form>
          )}

          <div className="mt-6 pt-2 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 font-label-lg text-label-md sm:text-label-lg text-primary hover:text-gold font-medium transition-colors group"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform">
                ←
              </span>
              <span>Back to Login</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Having trouble accessing your student portal? Reach the
            Registrar&apos;s office at{" "}
            <a
              className="text-primary font-medium hover:underline"
              href="mailto:info@rccgnasod.org"
            >
              info@rccgnasod.org
            </a>
            .
          </p>
        </div>
      </Stack>

      <AppModal
        isOpen={isOtpModalOpen}
        close={() => setIsOtpModalOpen(false)}
        title="Verify Reset Code"
        icon
      >
        <div className="w-[min(360px,80vw)] mt-2 space-y-5 font-sans">
          <Typography
            level="body-sm"
            sx={{ fontFamily: '"DM Sans", sans-serif', color: "#45464f" }}
          >
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold text-navy">{email}</span>
          </Typography>

          <div className="flex justify-center py-2">
            <OtpComponent
              onChange={setOtp}
              loading={verifyingOtp || resendingToken || resettingPassword}
            />
          </div>

          <p className="text-xs text-center text-on-surface-variant">
            Didn&apos;t get the code?{" "}
            <button
              type="button"
              onClick={onResendToken}
              disabled={
                resendingToken ||
                verifyingOtp ||
                resettingPassword ||
                countdown > 0
              }
              className="font-semibold text-navy hover:text-gold underline decoration-gold underline-offset-4 disabled:opacity-50 cursor-pointer"
            >
              {resendingToken
                ? "Sending..."
                : countdown > 0
                  ? `Resend in ${countdown}s`
                  : "Resend"}
            </button>
          </p>

          <Stack direction="row" gap={2}>
            <AppButton
              type="button"
              loading={verifyingOtp}
              disabled={verifyingOtp || resettingPassword}
              onClick={verifyOtp}
              className="flex-1! h-11! rounded-full! bg-navy! hover:bg-navy-light! text-on-primary! cursor-pointer"
            >
              Verify Code
            </AppButton>
            <AppButton
              type="button"
              variant="outlined"
              onClick={() => setIsOtpModalOpen(false)}
              disabled={verifyingOtp || resettingPassword}
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

export default ForgotPassword;
