import { Controller, useForm } from "react-hook-form";
import Input from "../components/input/input.component";
import { Button } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { handleError } from "../utils";
import Hero from "../components/hero/Hero";
type Form = {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  phone: string;
  address: string;
};
const Register = () => {
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      gender: "",
      phone: "",
      admissionYear: "",
      address: "",
    },
  });
  const onSubmit = async (data: Form) => {
    console.log(data);
    setLoading(true);
    try {
      const res = await axios.post<ApiResponseN<null>>("/auth/signup", data);
      toast.success(res.data.message);
    } catch (error) {
      console.log({ error });
      toast.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <Hero title="Register for School of Disciples" subtitle="Kindly complete your registration and make payment for SOD" />
      <div className="container mx-auto py-16">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-aut">
          <div className="grid gap-4 grid-cols-2">
            <div>
              <Controller
                name="firstName"
                control={control}
                rules={{
                  required: "This field is required",
                }}
                render={({ field: { value, onChange } }) => (
                  <Input label="First Name" value={value} onChange={onChange} />
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
                  <Input label="Last Name" value={value} onChange={onChange} />
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
                <p className="text-xs text-[#dc2626]">{errors.email.message}</p>
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
                <p className="text-xs text-[#dc2626]">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <Controller
                name="gender"
                control={control}
                rules={{
                  required: "This field is required",
                }}
                render={({ field: { value, onChange } }) => (
                  <label className="text-header flex flex-col gap-1">
                    Gender
                    <select
                      value={value}
                      onChange={onChange}
                      className="rounded-md border border-[#C9C9C9] p-3 font-medium text-[#22272F] outline-none placeholder:text-sm placeholder:text-[#C9C9C9]"
                    >
                      <option value=""></option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </label>
                )}
              />
              {errors.gender && (
                <p className="text-xs text-[#dc2626]">
                  {errors.gender.message}
                </p>
              )}
            </div>
            <div>
              <Controller
                name="admissionYear"
                control={control}
                rules={{
                  required: "This field is required",
                }}
                render={({ field: { value, onChange } }) => (
                  <label className="text-header flex flex-col gap-1">
                    Year
                    <select
                      value={value}
                      onChange={onChange}
                      className="rounded-md border border-[#C9C9C9] p-3 font-medium text-[#22272F] outline-none placeholder:text-sm placeholder:text-[#C9C9C9]"
                    >
                      <option value=""></option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </select>
                  </label>
                )}
              />
              {errors.admissionYear && (
                <p className="text-xs text-[#dc2626]">{errors.admissionYear.message}</p>
              )}
            </div>
            <div className="col-span-2">
              <Controller
                name="address"
                control={control}
                rules={{
                  required: "This field is required",
                }}
                render={({ field: { value, onChange } }) => (
                  <div>
                    <label className="text-header flex flex-col gap-1">
                      Address
                      <textarea
                        name=""
                        id=""
                        rows={5}
                        value={value}
                        onChange={onChange}
                        className="rounded-md border border-[#C9C9C9] p-3 font-medium text-[#22272F] outline-none placeholder:text-sm placeholder:text-[#C9C9C9]"
                      ></textarea>
                    </label>
                  </div>
                )}
              />
              {errors.address && (
                <p className="text-xs text-[#dc2626]">
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center mt-8">
            <Button
              variant="contained"
              type="submit"
              loading={loading}
              disabled={loading}
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
