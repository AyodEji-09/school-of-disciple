import { useState } from "react";
import UseBox from "../../components/usebox/UseBox";
import { Option, Select, Stack, Typography } from "@mui/joy";
import AppButton from "../../components/Button/AppButton";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Controller, useForm } from "react-hook-form";
import { handleError } from "../../utils";
import axios from "axios";
import Input from "../../components/input/input.component";
import { useGetAllCenterQuery } from "../../data/rtk/center";

interface FormType {
  email: string;
  centerId: string;
}
const AddCenterManager = () => {
  const navigate = useNavigate();

  const { data: centers } = useGetAllCenterQuery();
  console.log({ centers });

  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      centerId: "",
    },
  });

  const onSubmit = async (data: FormType) => {
    console.log({ data });
    setLoading(true);
    try {
      const res = await axios.post("/admin/invite-coordinator", data);
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
    <UseBox>
      <Stack mt={6}>
        <Typography level="h3">Invite Center Manager</Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        <div className="space-y-4 mt-8">
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
              <p className="text-[#dc2626] text-xs">{errors?.email?.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="">Center</label>
            <Controller
              name="centerId"
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange } }) => (
                <Select onChange={(e, value) => onChange(value)}>
                  {centers?.data?.docs?.map((item, idx) => (
                    <Option key={idx} value={item?._id}>
                      {item?.name}
                    </Option>
                  ))}
                </Select>
              )}
            />
            {errors.centerId && (
              <p className="text-[#dc2626] text-xs">This field is required.</p>
            )}
          </div>
        </div>
        <Stack marginTop={8}>
          <AppButton loading={loading} disabled={loading}>
            Invite
          </AppButton>
        </Stack>
      </form>
    </UseBox>
  );
};

export default AddCenterManager;
