import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { Box, Button, Container, Stack, Typography } from "@mui/joy";
import Input from "../components/input/input.component";
import { toast } from "react-toastify";
import { handleError } from "../utils";
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

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      password: "",
      email: "",
    },
  });
  const onSubmit = async (data: FormType) => {
    console.log({ data });
    setLoading(true);
    try {
      const res = await axios.post<ApiResponseN<null>>(
        `/auth/accept-invite/${token}`,
        data
      );
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
    <Box pb={4}>
      <Container>
        <div className="max-w-lg mx-auto border mt-28 rounded-md p-4">
          <Box>
            <Stack>
              <Typography level="h3" textAlign={"center"}>
                Center Coordinator
              </Typography>
              <Typography textAlign={"center"} level="body-sm">
                Lets get to know you more
              </Typography>
            </Stack>

            <form
              className="max-w-sm mx-auto mt-8"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="space-y-4 mt-8">
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
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                  {errors.firstName && (
                    <p className="text-[#dc2626] text-xs">
                      This field is required.
                    </p>
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
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                  {errors.lastName && (
                    <p className="text-[#dc2626] text-xs">
                      This field is required.
                    </p>
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
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                  {errors.email && (
                    <p className="text-[#dc2626] text-xs">
                      {errors.email.message}
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
              <Stack marginTop={8}>
                <Button type="submit" loading={loading} disabled={loading}>
                  Complete Registration
                </Button>
              </Stack>
            </form>
            <Typography level="body-xs" textAlign={"center"} mt={2}>
              Have an account?{" "}
              <Link to={"/login"} className="font-bold underline">
                Log In
              </Link>
            </Typography>
          </Box>
        </div>
      </Container>
    </Box>
  );
};

export default AcceptInvite;
