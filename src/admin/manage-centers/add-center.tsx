import UseBox from "../../components/usebox/UseBox";
import { Stack, Typography } from "@mui/joy";
import AppButton from "../../components/Button/AppButton";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { handleError } from "../../utils";
import Input from "../../components/input/input.component";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useCreateCenterMutation } from "../../data/rtk/center";

interface FormType {
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const AddCenter = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [createCenter] = useCreateCenterMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });

  const onSubmit = async (data: FormType) => {
    console.log({ data });
    setLoading(true);

    try {
      const res = await createCenter(data).unwrap();
      console.log({ res });
      toast.success(res.message || "Center created successfully");
      navigate("/manage-centers");
    } catch (error) {
      console.log({ error });
      const rtkError = error as {
        data?: { message?: string };
        message?: string;
      };
      toast.error(
        rtkError?.data?.message || rtkError?.message || handleError(error),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <UseBox>
      <Stack mt={6}>
        <Typography level="h3">Add Center</Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        <div className="space-y-4 text-[#000C51]">
          <Stack width={"100%"} gap={2}>
            <Stack gap={4} width={"100%"}>
              <div>
                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      label="Center Name"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-[#dc2626] text-xs">
                    This field is required.
                  </p>
                )}
              </div>
              <div>
                <Controller
                  name="address"
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      label="Street Address"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                {errors.address && (
                  <p className="text-[#dc2626] text-xs">
                    This field is required.
                  </p>
                )}
              </div>
              <div>
                <Controller
                  name="city"
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={({ field: { value, onChange } }) => (
                    <Input label="City" value={value} onChange={onChange} />
                  )}
                />
                {errors.city && (
                  <p className="text-[#dc2626] text-xs">
                    This field is required.
                  </p>
                )}
              </div>
              <div>
                <Controller
                  name="state"
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={({ field: { value, onChange } }) => (
                    <Input label="State" value={value} onChange={onChange} />
                  )}
                />
                {errors.state && (
                  <p className="text-[#dc2626] text-xs">
                    This field is required.
                  </p>
                )}
              </div>
              <div>
                <Controller
                  name="postalCode"
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      label="Postal Code"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                {errors.postalCode && (
                  <p className="text-[#dc2626] text-xs">
                    This field is required.
                  </p>
                )}
              </div>
              <div>
                <Controller
                  name="country"
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={({ field: { value, onChange } }) => (
                    <Input label="Country" value={value} onChange={onChange} />
                  )}
                />
                {errors.country && (
                  <p className="text-[#dc2626] text-xs">
                    This field is required.
                  </p>
                )}
              </div>
            </Stack>
          </Stack>
        </div>
        <Stack marginTop={8}>
          <AppButton loading={loading} disabled={loading}>
            Add Center
          </AppButton>
        </Stack>
      </form>
    </UseBox>
  );
};

export default AddCenter;
