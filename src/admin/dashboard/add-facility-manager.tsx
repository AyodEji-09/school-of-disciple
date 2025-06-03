import React, { useState } from "react";
import UseBox from "../../components/usebox/UseBox";
import { Stack, Typography } from "@mui/joy";
import AppButton from "../../components/Button/AppButton";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Controller, useForm } from "react-hook-form";
import { handleError } from "../../utils";
import axios from "axios";
import Input from "../../components/input/input.component";

interface FormType {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
const AddCenterManager = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultValue = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  };


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
      phone: "",
    },
  });

  const onSubmit = async (data: FormType) => {
    console.log({ data });
    setLoading(true);
    try {
      const res = await axios.post("/auth/invite-facility-manager", data);
      console.log({ res });
      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
      console.log({ error });
      toast.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };
  return (
    <UseBox img="facility-manager.png">
      <Stack mt={6}>
        <Typography level="h3">Add Center Manager</Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        <div className="space-y-4 mt-8">
          <div>
            <Controller
              name="firstName"
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { value, onChange } }) => (
                <Input label="First Name" value={value} onChange={onChange} />
              )}
            />
            {errors.firstName && (
              <p className="text-[#dc2626] text-xs">This field is required.</p>
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
                <Input label="Last Name" value={value} onChange={onChange} />
              )}
            />
            {errors.lastName && (
              <p className="text-[#dc2626] text-xs">This field is required.</p>
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
              <p className="text-[#dc2626] text-xs">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Controller
              name="phone"
              control={control}
              rules={{
                required: { value: true, message: "This field is required" },
                maxLength: { value: 11, message: "Cannot exceed 11 digits" },
              }}
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Phone Number"
                  type="number"
                  value={value}
                  onChange={(value) => onChange(value)}
                />
              )}
            />
            {errors.phone && (
              <p className="text-[#dc2626] text-xs">{errors.phone.message}</p>
            )}
          </div>
        </div>
        <Stack marginTop={8}>
          <AppButton loading={loading} disabled={loading}>
            Add Center Manager
          </AppButton>
        </Stack>
      </form>
    </UseBox>
  );
};

export default AddCenterManager;
