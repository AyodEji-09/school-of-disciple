import { Avatar, Box, Button, MenuItem, Stack, Typography } from "@mui/joy";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { IoIosClose } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { handleError } from "../../utils";
import { useAppDispatch, useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import { logout } from "../../data/reducers/userSlice";
import Input from "../input/input.component";

interface FormType {
  oldPassword: string;
  newPassword: string;
}

const Profile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);

  return (
    <Box>
      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        bgcolor={"white"}
        padding={1}
        borderRadius={4}
        sx={{ width: { xs: "270px", md: "350px" } }}
      >
        <Typography level="h4" textColor={"#001F54"}>
          Profile
        </Typography>
        <MenuItem>
          <button className="">
            <IoIosClose />
          </button>
        </MenuItem>
      </Stack>
      <Stack
        overflow={"auto"}
        maxHeight={500}
        paddingBottom={2}
        className="scrollbar-hide"
      >
        <Stack
          direction={"row"}
          sx={{ width: { xs: "270px", md: "350px" } }}
          bgcolor={"white"}
          padding={1}
          borderRadius={"8px 8px 0 0"}
          gap={1}
          marginTop={2}
        >
          <Box width={"100%"}>
            <Stack direction={"row"} gap={4}>
              {/* <img
                src={require("../../assets/images/img/profile.png")}
                alt="profile"
                className="h-32"
              /> */}
              <Avatar size="lg">
                {user && user?.firstName[0] + user?.lastName[0]}
              </Avatar>
              <Stack gap={1}>
                <Typography textColor={"#001F54"} level="title-lg">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography>{user?.type}</Typography>
              </Stack>
            </Stack>
            <Box component={"div"} mt={4}>
              <Stack
                direction={"row"}
                gap={4}
                paddingY={2}
                borderBottom={"1px solid #023C5A80"}
                width={"100%"}
              >
                <Typography level="body-sm" textColor={"common.black"}>
                  Phone Number
                </Typography>
                <Typography level="title-sm" fontWeight={"bold"}>
                  {user?.phone}
                </Typography>
              </Stack>
              <Stack direction={"row"} gap={4} paddingY={2}>
                <Typography level="body-sm" textColor={"common.black"}>
                  Email Address
                </Typography>
                <Typography level="title-sm" fontWeight={"bold"}>
                  {user?.email}
                </Typography>
              </Stack>
              <Stack direction={"row"} gap={4} paddingY={2}>
                <Typography level="body-sm" textColor={"common.black"}>
                  Address
                </Typography>
                <Typography level="title-sm" fontWeight={"bold"}>
                  {user?.address}
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Stack>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          bgcolor={"white"}
          padding={1}
          borderRadius={4}
          sx={{ width: { xs: "270px", md: "350px" } }}
          marginTop={2}
        >
          <Typography level="title-md">Password</Typography>
        </Stack>
        <Stack
          justifyContent={"space-between"}
          alignItems={"center"}
          bgcolor={"white"}
          // padding={1}
          borderRadius={4}
          sx={{ width: { xs: "270px", md: "350px" } }}
          marginTop={1}
        >
          <ChangePassword />
        </Stack>
        <div className="p-4 bg-white mt-2 rounded-md">
          <Button
            sx={{
              width: "100%",
              borderRadius: 25,
              backgroundColor: "#C80000",
              ":hover": { background: "#C80000" },
            }}
            onClick={() => {
              dispatch(logout());
              navigate("/");
            }}
          >
            Log out
          </Button>
        </div>
      </Stack>
    </Box>
  );
};

export default Profile;

const ChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  });

  const onSubmit = async (data: FormType) => {
    console.log({ data });
    setLoading(true);
    try {
      const res = axios.post("/auth/change-password", data);
      toast.success((await res).data.message);
    } catch (error) {
      console.log({ error });
      const err = error as ApiError;
      toast.error(handleError(err));
    }
    setLoading(false);
  };
  return (
    <form className=" w-full p-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4 mt-8">
        <div>
          <Controller
            name="oldPassword"
            control={control}
            rules={{
              required: "This field is required",
            }}
            render={({ field: { value, onChange } }) => (
              <Input
                label="Old Password"
                type="password"
                value={value}
                onChange={onChange}
              />
            )}
          />
          {errors.oldPassword && (
            <p className="text-[#dc2626] text-xs">
              {/* {errors.oldPassword.message} */}
              This field is required
            </p>
          )}
        </div>
        <div>
          <Controller
            name="newPassword"
            control={control}
            rules={{
              required: "This field is required",
              pattern: {
                value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s]).{8,}$/g,
                message:
                  "Your password must have at least one uppercase letter, one lowercase letter, one digit, one special character, and a minimum length of 8 characters.",
              },
            }}
            render={({ field: { value, onChange } }) => (
              <Input
                label="New Password"
                type="password"
                value={value}
                onChange={onChange}
              />
            )}
          />
          {errors.newPassword && (
            <p className="text-[#dc2626] text-xs">
              {errors.newPassword.message}
            </p>
          )}
        </div>
      </div>
      <Box display={"flex"} justifyContent={"center"} marginTop={6}>
        <Button
          sx={{ width: "100%", borderRadius: 25, background: "#001EC5" }}
          loading={loading}
          disabled={loading}
          type="submit"
        >
          Reset Password
        </Button>
      </Box>
    </form>
  );
};
