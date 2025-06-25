import UseBox from "../../components/usebox/UseBox";
import { Stack, Typography } from "@mui/joy";
import AppButton from "../../components/Button/AppButton";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { handleError } from "../../utils";
import Input from "../../components/input/input.component";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface FormType {
  name: string;
  address: string;
}

const AddCenter = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      address: "",
    },
  });

  const onSubmit = async (data: FormType) => {
    console.log({ data });
    setLoading(true);

    try {
      const res = await axios.post("/center", data);
      console.log({ res });
      navigate("/manage-centers");
    } catch (error) {
      console.log({ error });
      toast.error(handleError(error));
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
                      label="Center Address"
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
