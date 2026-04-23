import { useState } from "react";
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
    <UseBox img="login-bg.png">
      <Stack mt={8}>
        <Typography level="h2">Forgot Password</Typography>
        <Typography level="body-sm" mt={1} textColor="#6B7280">
          {otpVerified
            ? `Create a new password for ${email}`
            : "Enter your email and we will send a reset code."}
        </Typography>

        {!hasRequestedToken && (
          <form className="mt-8" onSubmit={handleEmailSubmit(onRequestToken)}>
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
                  value={value}
                  onChange={onChange}
                />
              )}
            />
            {emailErrors.email && (
              <p className="text-[#dc2626] text-xs mt-1">
                {emailErrors.email.message}
              </p>
            )}

            <Stack mt={4}>
              <AppButton loading={requestingToken} disabled={requestingToken}>
                Send Reset Code
              </AppButton>
            </Stack>
          </form>
        )}

        {hasRequestedToken && !otpVerified && (
          <div className="mt-8 space-y-3">
            <Typography level="body-sm" textColor="#6B7280">
              Enter the code sent to <b>{email}</b> to continue.
            </Typography>
            <Stack direction="row" gap={2}>
              <AppButton type="button" onClick={() => setIsOtpModalOpen(true)}>
                Enter Code
              </AppButton>
              <AppButton
                type="button"
                variant="outlined"
                onClick={onResendToken}
                disabled={resendingToken}
              >
                {resendingToken ? "Sending..." : "Resend Code"}
              </AppButton>
            </Stack>
          </div>
        )}

        {hasRequestedToken && otpVerified && (
          <form
            className="mt-8 space-y-4"
            onSubmit={handleResetSubmit(onResetPassword)}
          >
            <Controller
              name="password"
              control={resetControl}
              rules={{ required: "New password is required" }}
              render={({ field: { value, onChange } }) => (
                <Input
                  label="New Password"
                  type="password"
                  value={value}
                  onChange={onChange}
                />
              )}
            />
            {resetErrors.password && (
              <p className="text-[#dc2626] text-xs -mt-2">
                {resetErrors.password.message}
              </p>
            )}

            <Controller
              name="confirmPassword"
              control={resetControl}
              rules={{ required: "Confirm your password" }}
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Confirm Password"
                  type="password"
                  value={value}
                  onChange={onChange}
                />
              )}
            />
            {resetErrors.confirmPassword && (
              <p className="text-[#dc2626] text-xs -mt-2">
                {resetErrors.confirmPassword.message}
              </p>
            )}

            <Stack mt={2}>
              <AppButton
                loading={resettingPassword}
                disabled={resettingPassword}
              >
                Reset Password
              </AppButton>
            </Stack>
          </form>
        )}

        <Typography level="body-xs" textAlign="center" mt={3}>
          Back to{" "}
          <Link to="/login" className="font-bold underline">
            Login
          </Link>
        </Typography>
      </Stack>

      <AppModal
        isOpen={isOtpModalOpen}
        close={() => setIsOtpModalOpen(false)}
        title="Verify Reset Code"
        icon
      >
        <div className="w-[min(360px,80vw)] mt-2 space-y-5">
          <Typography level="body-sm" textColor="#6B7280">
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold text-[#001F54]">{email}</span>
          </Typography>

          <div className="flex justify-center py-2">
            <OtpComponent
              onChange={setOtp}
              loading={verifyingOtp || resendingToken || resettingPassword}
            />
          </div>

          <p className="text-xs text-center text-[#6B7280]">
            Didn't get the code?{" "}
            <button
              type="button"
              onClick={onResendToken}
              disabled={resendingToken || verifyingOtp || resettingPassword}
              className="font-semibold text-[#001EC5] hover:underline disabled:opacity-50"
            >
              {resendingToken ? "Sending..." : "Resend"}
            </button>
          </p>

          <Stack direction="row" gap={2}>
            <AppButton
              type="button"
              loading={verifyingOtp}
              disabled={verifyingOtp || resettingPassword}
              onClick={verifyOtp}
            >
              Verify Code
            </AppButton>
            <AppButton
              type="button"
              variant="outlined"
              onClick={() => setIsOtpModalOpen(false)}
              disabled={verifyingOtp || resettingPassword}
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
