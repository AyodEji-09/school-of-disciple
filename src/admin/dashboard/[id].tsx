import Frame from "../../components/frame/Frame";
import { Box, Typography } from "@mui/joy";
import AvatarText from "../../components/avatar-text/AvatarText";
import AppButton from "../../components/Button/AppButton";
import { useGetUserQuery } from "../../data/rtk/user";
import { useParams } from "react-router-dom";
import { getUserFullName } from "../../utils";
import moment from 'moment';

const CenterManager = () => {
  const { id } = useParams();
  const { data: user } = useGetUserQuery(id ?? "");
  console.log({ user });

  return (
    <Frame text="Center Manager">
      <div className="grid md:grid-cols-3 gap-4 mt-4 pb-8">
        <div className="rounded-lg overflow-hidden bg-white">
          <div className="h-64 overflow-hidden">
            <img className="h-full w-full object-cover" src={user?.data?.avatar?.url ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"} alt="" />
          </div>
          <div className="p-4 space-y-4">
            <Details title="Name" text={getUserFullName(user?.data)} />
            <Details title="Email address" text={user?.data?.email ?? ""} />
            <Details title="Phone number" text={user?.data?.phone ?? ""} />
            <Details title="Date added" text={moment(user?.data?.createdAt).format("DD MMM YYYY")} />
          </div>
        </div>
        <div className="md:col-span-2 bg-white p-4">
          <Box
            minHeight={400}
            position={"relative"}
            className={"overflow-x-auto"}
          >
            <table className="w-full text-sm text-left rtl:text-right text-[#001F54]">
              <thead className="text-xs">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Center name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Center Address
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-medium">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AvatarText text={user?.data?.center?.name ?? ""} />
                  </td>
                  <td className="px-6 py-4">{user?.data?.center?.address}</td>
                  <td className="px-6 py-4">
                    <AppButton onClick={() => {}} className="bg-red-700">
                      Unassign
                    </AppButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </Box>
        </div>
      </div>
      {/* modal */}

      {/* <AppModal isOpen={isOpen} close={toggleModal}>
        {mode === "unassign" && (
          <Box maxWidth={400}>
            <div className="flex justify-center">
              <WarningIcon />
            </div>
            <Typography level="h2" textAlign={"center"} mb={2}>
              Unassign Manager?
            </Typography>
            <Typography level="body-md" textAlign={"center"} mb={2}>
              You are about to unassign this estate from the manager (name of
              Manager){" "}
            </Typography>
            <Typography level="body-md" textAlign={"center"} mb={2}>
              Do you want to proceed with this action?
            </Typography>
            <Stack mt={4}>
              <AppButton
                onClick={unassignManager}
                loading={loading}
                disabled={loading}
              >
                Yes, Unassign
              </AppButton>
              <AppButton variant="plain" onClick={() => toggleModal()}>
                No, Back
              </AppButton>
            </Stack>
          </Box>
        )}
        {mode === "success" && (
          <Box maxWidth={400}>
            <div className="flex justify-center">
              <SuccessIcon />
            </div>
            <Typography level="h2" textAlign={"center"} mb={2}>
              Successfully Unassiged?
            </Typography>
            <Typography level="body-md" textAlign={"center"} mb={2}>
              You have successfully unassigned ( Name Manager) from the estate
            </Typography>
            <Stack mt={4}>
              <AppButton variant="plain" onClick={() => toggleModal()}>
                Okay
              </AppButton>
            </Stack>
          </Box>
        )}
      </AppModal> */}
    </Frame>
  );
};

export default CenterManager;

const Details = ({ title, text }: { title: string; text: string | number }) => {
  return (
    <div className="flex justify-between gap-1 items-center flex-wrap">
      <Typography level="body-md" textColor={"#000000"}>
        {title}
      </Typography>
      <Typography level="body-sm">{text}</Typography>
    </div>
  );
};
