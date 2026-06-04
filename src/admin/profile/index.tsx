import {
  Box,
  Card,
  Divider,
  IconButton,
  Input,
  Stack,
  Switch,
  Typography,
} from "@mui/joy";
import React, {
  MouseEventHandler,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import DefaultHeader from "../../components/default-header/DefaultHeader";
import { EditIcon, FiveStar } from "../../components/icons";
import AppModal from "../../components/modal/modal";
import OtpComponent from "../../components/otp-component/OtpComponent";
import AppButton from "../../components/Button/AppButton";
import { useAppDispatch } from "../../data/store/hooks";
import { logout } from "../../data/store/reducers/userSlice";
import { useNavigate } from "react-router-dom";
import { GlobalState } from "../../data/Context";
import { BiSolidEdit } from "react-icons/bi";

const Profile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("");
  const { setUserRole } = useContext(GlobalState);

  const toggleModal = (mode?: string) => {
    if (mode) setMode(mode);
    setIsOpen(!isOpen);
  };
  return (
    <DefaultHeader title="Dashboard">
      <Box component={"header"}>
        <Box marginY={4} height={200} borderRadius={8} position={"relative"}>
          <Box
            marginTop={8}
            height={200}
            borderRadius={8}
            overflow={"hidden"}
          >
            <img
              src={require("../../assets/images/bg-home.png")}
              alt="bg-header"
              className="object-cover h-full w-full object-lef"
            />
            <Box position={"absolute"} bottom={-120} left={20}>
              <Box
                height={150}
                width={150}
                borderRadius={80}
                overflow={"hidden"}
              >
                <img
                  src={require("../../assets/images/img-header.png")}
                  alt="bg-header"
                  className="object-cover h-full object-top"
                />
              </Box>
              <Box marginTop={2}>
                <Typography
                  level="h4"
                  textAlign={"center"}
                  textColor={"#001272"}
                >
                  {/* {user.firstName} {user.lastName} */}
                </Typography>
                <div className="w-fit">
                  <FiveStar />
                </div>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box component={"section"} marginTop={20} paddingBottom={8}>
        <Card variant="outlined">
          <Typography level="h4">Overview</Typography>
          <Stack gap={3}>
            <Options title="Email Address" text="comapany@gmail.com">
              <button
                className="text-white rounded-full px-4 h-8 bg-[#00A912] text-sm"
                onClick={() => toggleModal("verification")}
              >
                Verified
              </button>
            </Options>
            <Options title="Contact Information" text="0816404589272">
              <Stack direction={"row"} gap={2} alignItems={"center"}>
                <IconButton onClick={() => toggleModal("edit contact")}>
                  <EditIcon />
                </IconButton>
                <button className="text-white rounded-full px-4 h-8 bg-[#001EC5] text-sm">
                  Verify
                </button>
              </Stack>
            </Options>
            <Options title="Address" text="1labore et dolore magna aliqua" />
            <Options title="Security" text="Pin Verification">
              <Switch
                color={false ? "success" : "primary"}
                slotProps={{
                  track: {
                    children: (
                      <React.Fragment>
                        <Typography
                          component="span"
                          level="inherit"
                          sx={{ ml: "10px" }}
                        >
                          On
                        </Typography>
                        <Typography
                          component="span"
                          level="inherit"
                          sx={{ mr: "8px" }}
                        >
                          Off
                        </Typography>
                      </React.Fragment>
                    ),
                  },
                }}
                sx={{
                  "--Switch-thumbSize": "24px",
                  "--Switch-trackWidth": "60px",
                  "--Switch-trackHeight": "30px",
                }}
                checked={true}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  toggleModal("security")
                }
              />
            </Options>
            <div
              onClick={() => {
                setUserRole("");
                dispatch(logout());
                navigate("/");
              }}
              className="flex w-fit cursor-pointer"
            >
              <Typography level="title-lg" width={"fit-content"}>
                Logout
              </Typography>
            </div>
          </Stack>
        </Card>
      </Box>

      {/* modal */}
      <AppModal isOpen={isOpen} close={toggleModal} icon>
        {mode === "verification" && <OtpModal setMode={setMode} />}
        {mode === "successful" && (
          <SuccessModal handleSuccess={() => toggleModal} />
        )}
        {mode === "edit contact" && <EditContact setMode={setMode} />}
        {mode === "security" && <Security toggleModal={toggleModal} />}
      </AppModal>
    </DefaultHeader>
  );
};

export default Profile;

const Options = ({
  title,
  text,
  children,
}: PropsWithChildren<{ title: string; text: string }>) => {
  return (
    <Box>
      <Stack
        mb={1}
        direction={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Stack>
          <Typography level="body-md">{title}</Typography>
          <Typography
            level="body-lg"
            fontWeight={500}
            textColor={"common.black"}
          >
            {text}
          </Typography>
        </Stack>
        {children}
      </Stack>
      <Divider></Divider>
    </Box>
  );
};

const OtpModal = ({ setMode }: { setMode: (mode: string) => void }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const handleOtpChange = (data: string): void => {
    setCode(data);
  };

  useEffect(() => {
    if (code.length === 4) setMode("successful");
  }, [code]);
  return (
    <Box maxWidth={400}>
      <Typography level="title-lg" mb={2} textAlign={"center"}>
        Verification
      </Typography>
      <Divider></Divider>
      <Typography level="body-md" my={2} textAlign={"center"}>
        A token has been sent to your phone number 08164237666
      </Typography>
      <Stack alignItems={"center"} mt={4}>
        <OtpComponent
          stateData={code}
          textChange={handleOtpChange}
          css="borderColor"
          loading={loading}
          numInputs={4}
          separator={""}
        />
      </Stack>
      <Typography level="body-sm" textAlign={"center"} mt={6}>
        2:00 minutes
      </Typography>
      <Typography level="body-sm" textAlign={"center"} mt={2}>
        Didnt recieve any?{" "}
        <Typography component={"span"} fontWeight={"bold"}>
          Resend
        </Typography>
      </Typography>
    </Box>
  );
};

const SuccessModal = ({
  handleSuccess,
}: {
  handleSuccess: MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <Box maxWidth={400}>
      <Typography level="h4" mb={2} textAlign={"center"}>
        Verification
      </Typography>
      <Divider></Divider>
      <Typography level="body-md" my={2} textAlign={"center"}>
        Your phone number has been successfully updated
      </Typography>
      <Stack mt={4}>
        <AppButton onClick={handleSuccess}>Okay</AppButton>
      </Stack>
    </Box>
  );
};

const EditContact = ({ setMode }: { setMode: (mode: string) => void }) => {
  return (
    <div className="min-w-40">
      <Typography level="h3" textAlign={"center"}>
        Edit Phone Number
      </Typography>
      <Divider sx={{ border: "1px solid black", margin: "16px 0" }}></Divider>
      <Stack>
        <Stack gap={0.5} marginTop={3}>
          <label className="text-sm font-medium">Phone Number</label>
          <Input />
        </Stack>
        <Typography level="body-xs" fontStyle={"italic"} maxWidth={300} mt={2}>
          An OTP will be sent to your phone number to verify this update
        </Typography>
      </Stack>
      <Stack mt={4}>
        <AppButton onClick={() => setMode("verification")}>Update</AppButton>
      </Stack>
    </div>
  );
};

const Security = ({ toggleModal }: { toggleModal: () => void }) => {
  return (
    <div className="min-w-40">
      <Typography level="h3" textAlign={"center"}>
        An extra layer of security.
      </Typography>
      <Divider sx={{ border: "1px solid black", margin: "16px 0" }}></Divider>
      <Stack>
        <Typography
          level="body-sm"
          fontWeight={"light"}
          textAlign={"center"}
          maxWidth={300}
          mt={2}
        >
          Turning this on will share a pin verification with you and other
          users.
        </Typography>
        <Typography
          level="body-sm"
          fontWeight={"light"}
          textAlign={"center"}
          maxWidth={300}
          mt={2}
        >
          You can use this to confirm the identity of a user before a physical
          meeting.
        </Typography>
      </Stack>
      <Stack mt={4}>
        <AppButton onClick={toggleModal}>Turn On</AppButton>
      </Stack>
    </div>
  );
};
