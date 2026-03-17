import { Controller, useForm } from "react-hook-form";
import Input from "../components/input/input.component";
import { Button } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { handleError } from "../utils";
import Hero from "../components/hero/Hero";
import { Option, Select } from "@mui/joy";
import { useGetAllCenterQuery } from "../data/rtk/center";
import { useNavigate } from "react-router-dom";
type Form = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  centerId: string;
  password: string;
};
const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { data: centers } = useGetAllCenterQuery();

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

  const onSubmit = async (data: Form) => {
    console.log(data);
    setLoading(true);
    try {
      const res = await axios.post<ApiResponseN<null>>("/auth/register", data);
      toast.success(res.data.message);
      navigate("/login");
    } catch (error) {
      console.log({ error });
      toast.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <Hero
        title="Register for School of Disciples"
        subtitle="Kindly complete your registration and make payment for SOD"
      />
      <div className="container mx-auto py-16">
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
              <label htmlFor="">Center</label>
              <Controller
                name="centerId"
                control={control}
                // rules={{
                //   required: true,
                // }}
                render={({ field: { onChange } }) => (
                  <Select
                    onChange={(_, value) => onChange(value)}
                    className="h-12"
                  >
                    {centers?.data.docs.length ? (
                      centers?.data?.docs?.map((item) => (
                        <Option value={item._id}>{item.name}</Option>
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
          <div className="flex items-center mt-8">
            <Button
              variant="contained"
              type="submit"
              loading={loading}
              disabled={loading}
              fullWidth
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
