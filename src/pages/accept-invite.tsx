import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import Input from "../components/input/input.component";
import AppButton from "../components/Button/AppButton";
import { toast } from "react-toastify";
import { handleError, titleCaseName } from "../utils";
import axios from "axios";

type FormType = {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  email: string;
};

const AcceptInvite = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const invitedEmail = searchParams.get("email") || "";
  const invitedFirstName = searchParams.get("firstName") || "";
  const invitedLastName = searchParams.get("lastName") || "";

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormType>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      password: "",
      email: "",
    },
  });

  useEffect(() => {
    if (invitedEmail) setValue("email", invitedEmail);
    if (invitedFirstName) setValue("firstName", titleCaseName(invitedFirstName));
    if (invitedLastName) setValue("lastName", titleCaseName(invitedLastName));
  }, [invitedEmail, invitedFirstName, invitedLastName, setValue]);

  const onSubmit = async (data: FormType) => {
    setLoading(true);
    try {
      const normalizedData = {
        ...data,
        firstName: titleCaseName(data.firstName),
        lastName: titleCaseName(data.lastName),
      };
      const res = await axios.post<ApiResponseN<null>>(
        `/auth/accept-invite/${token}`,
        normalizedData,
      );
      toast.success(res.data.message);
      navigate("/login");
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 bg-coolgray">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-xl p-5 sm:p-8 shadow-ambient border border-mist flex flex-col">
        <div className="text-left">
          <h1 className="font-headline-lg text-2xl sm:text-3xl text-primary font-bold sm:font-semibold tracking-tight">
            Center Coordinator
          </h1>
          <p className="font-body-md text-sm sm:text-base text-on-surface-variant mt-1.5 sm:mt-2 leading-relaxed">
            Let&apos;s get to know you more
          </p>
        </div>

        <form className="mt-6 sm:mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Controller
              name="firstName"
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { value, onChange } }) => (
                <Input
                  label="First Name"
                  placeholder="Enter first name"
                  value={value}
                  onChange={onChange}
                />
              )}
            />
            {errors.firstName && (
              <p className="text-error text-xs mt-1">This field is required.</p>
            )}
          </div>

          <div>
            <Controller
              name="lastName"
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Last Name"
                  placeholder="Enter last name"
                  value={value}
                  onChange={onChange}
                />
              )}
            />
            {errors.lastName && (
              <p className="text-error text-xs mt-1">This field is required.</p>
            )}
          </div>

          <div>
            <Controller
              name="email"
              control={control}
              rules={{
                required: "This field is required",
              }}
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. coordinator@rccgnasod.org"
                  value={value}
                  onChange={onChange}
                  disabled={Boolean(invitedEmail)}
                />
              )}
            />
            {errors.email && (
              <p className="text-error text-xs mt-1">
                {errors.email.message || "This field is required."}
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
              <p className="text-error text-xs mt-1">This field is required.</p>
            )}
          </div>

          <div className="pt-2 sm:pt-3">
            <AppButton
              loading={loading}
              disabled={loading}
              className="w-full! h-12! rounded-full! bg-primary! hover:bg-primary-container! text-on-primary! font-label-lg! text-sm sm:text-base font-medium! tracking-wide! transition-all shadow-ambient! flex items-center justify-center cursor-pointer"
            >
              Complete Registration
            </AppButton>
          </div>
        </form>

        <p className="mt-5 sm:mt-6 text-center text-xs sm:text-sm text-on-surface-variant">
          Have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-primary ml-1 transition-all underline decoration-gold decoration-2 underline-offset-4 hover:text-gold"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AcceptInvite;
