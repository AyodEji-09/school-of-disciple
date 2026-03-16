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

interface FormType {
  password: string;
  email: string;
}

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleOtpChange = (data: string): void => {
    setCode(data);
  };
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const requestEmailVerification = async () => {
    const res = await axios.post("/auth/request-token", {
      email: getValues().email,
      type: "verifyEmail",
    });
    return res;
  };

  const resendOtp = async () => {
    setLoading(true);
    try {
      const res = await requestEmailVerification();
      console.log({ res });
      toast.success(res.data.message);
    } catch (error) {
      console.log({ error });
      toast.error(handleError(error));
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/auth/verify-email-account", {
        token: code,
      });
      console.log({ res });
      toast.success(res.data.message);
      navigate("/login");
    } catch (error) {
      console.log({ error });
      if (
        (axios.isAxiosError(error) && error.response?.data?.message) ===
        "Your account has not been activated, Kindly verify your mail to activate your account"
      ) {
        return toggleModal;
      }
      toast.error(handleError(error));
    }
    setLoading(false);
  };

  const onsubmit = async (data: FormType) => {
    console.log({ data });
    setLoading(true);
    try {
      const res = await axios.post("/auth/login", data);
      console.log({ res });
      const user = res.data.data.user;
      if (!user.emailVerified) {
        setLoading(false);
        await requestEmailVerification();
        toggleModal();
        return toast.error("email not verified");
      }
      toast.success(res.data.message);
      dispatch(login(res.data.data));

      navigate("/");
    } catch (error) {
      console.log({ error });
      toast.error(handleError(error));
    }
    setLoading(false);
  };

  return (
    <UseBox img="login-bg.png">
      <Stack mt={8}>
        <Typography level="h2">Login</Typography>
        <form className="mt-10" onSubmit={handleSubmit(onsubmit)}>
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
                <p className="text-[#dc2626] text-xs">{errors.email.message}</p>
              )}
            </div>
            <div className="col-span-2">
              <Controller
                name="password"
                control={control}
                rules={{
                  required: "This field is required",
                  // pattern: {
                  //   value:
                  //     /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s]).{8,}$/g,
                  //   message:
                  //     "Your password must have at least one uppercase letter, one lowercase letter, one digit, one special character, and a minimum length of 8 characters.",
                  // },
                }}
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
                <p className="text-[#dc2626] text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="col-span-2 px-2">
              <Box
                color={"#000817"}
                justifyContent={"space-between"}
                display={"flex"}
              >
                <Checkbox label="Remember Me" sx={{ fontSize: 14 }} />
                <Typography
                  onClick={() => navigate("")}
                  level="body-xs"
                  textColor={"#404757"}
                >
                  Forget Password?
                </Typography>
              </Box>
            </div>
          </div>
          <Stack mt={6}>
            <AppButton loading={loading} disabled={loading}>
              Log In
            </AppButton>
          </Stack>
        </form>
        <Typography level="body-xs" textAlign={"center"} mt={2}>
          Have an account?{" "}
          <Link to={"/sign-up"} className="font-bold underline">
            Sign Up
          </Link>
        </Typography>
      </Stack>
      <AppModal isOpen={isOpen} close={toggleModal}>
        <Box>
          <Typography level="title-sm" textColor={"#000C51"}>
            beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia
            voluptas sit aspernatu
          </Typography>
          <Box marginTop={4} className="w-fit mx-auto">
            <OtpComponent onChange={handleOtpChange} loading={loading} />
            <p className="text-xs text-center font-semibold mt-2">
              Didn’t get the Code?{" "}
              <span
                className="font-bold hover:text-yellow-600 cursor-pointer"
                onClick={resendOtp}
              >
                Resend?
              </span>
            </p>
          </Box>
          <Box marginTop={8}>
            <AppButton
              variant="primary"
              className="w-full"
              loading={loading}
              disabled={loading}
              onClick={verifyOtp}
            >
              Verify
            </AppButton>
          </Box>
        </Box>
      </AppModal>
    </UseBox>
  );
};

export default Login;
