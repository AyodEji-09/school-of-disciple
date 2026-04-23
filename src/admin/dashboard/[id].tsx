import { useMemo, useState } from "react";
import Frame from "../../components/frame/Frame";
import { Box, Chip, Option, Select, Stack, Typography } from "@mui/joy";
import AvatarText from "../../components/avatar-text/AvatarText";
import AppButton from "../../components/Button/AppButton";
import {
  useGetUserQuery,
  useUpdateCoordinatorAssignmentMutation,
  useUpdateCoordinatorDeactivationMutation,
} from "../../data/rtk/user";
import { useGetAllCenterQuery } from "../../data/rtk/center";
import { useParams } from "react-router-dom";
import { formatCenterAddress, getUserFullName } from "../../utils";
import moment from "moment";
import { toast } from "react-toastify";
import { handleError } from "../../utils";

const CenterManager = () => {
  const { id } = useParams();
  const { data: user } = useGetUserQuery(id ?? "");
  const { data: centers } = useGetAllCenterQuery();
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [deactivationLoading, setDeactivationLoading] = useState(false);
  const [updateAssignment] = useUpdateCoordinatorAssignmentMutation();
  const [updateDeactivation] = useUpdateCoordinatorDeactivationMutation();
  console.log({ user });

  const manager = user?.data;
  const coordinatorStatus =
    manager?.coordinatorStatus ||
    (!manager?.emailVerified
      ? "pending"
      : manager?.deactivated
        ? "deactivated"
        : !manager?.center
          ? "unassigned"
          : "assigned");
  const initials =
    `${manager?.firstName?.[0] ?? ""}${manager?.lastName?.[0] ?? ""}`
      .toUpperCase()
      .slice(0, 2);

  const currentCenterId =
    typeof manager?.center === "string" ? manager.center : manager?.center?._id;

  const centerOptions = useMemo(() => centers?.data?.docs || [], [centers]);

  const getStatusChip = () => {
    const config = {
      assigned: { color: "success" as const, label: "Assigned" },
      unassigned: { color: "warning" as const, label: "Unassigned" },
      deactivated: { color: "danger" as const, label: "Deactivated" },
      pending: { color: "neutral" as const, label: "Pending Invite" },
    };

    return (
      <Chip color={config[coordinatorStatus].color} variant="soft" size="sm">
        {config[coordinatorStatus].label}
      </Chip>
    );
  };

  const handleAssignment = async (centerId: string | null) => {
    if (!manager?._id) return;
    setAssignmentLoading(true);
    try {
      const res = await updateAssignment({
        id: manager._id,
        centerId,
      }).unwrap();
      toast.success(res.message || "Coordinator updated successfully");
      if (centerId) setSelectedCenterId(centerId);
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleDeactivation = async (deactivated: boolean) => {
    if (!manager?._id) return;
    setDeactivationLoading(true);
    try {
      const res = await updateDeactivation({
        id: manager._id,
        deactivated,
      }).unwrap();
      toast.success(res.message || "Coordinator status updated");
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setDeactivationLoading(false);
    }
  };

  return (
    <Frame text="Center Manager">
      <div className="grid md:grid-cols-3 gap-4 mt-4 pb-8">
        <div className="rounded-lg overflow-hidden bg-white">
          <div className="h-64 overflow-hidden">
            {manager?.avatar?.url ? (
              <img
                className="h-full w-full object-cover"
                src={manager.avatar.url}
                alt={getUserFullName(manager)}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-[#E9EEF6] text-[#001F54] text-6xl font-semibold">
                {initials || "U"}
              </div>
            )}
          </div>
          <div className="p-4 space-y-4">
            <Details title="Name" text={getUserFullName(user?.data)} />
            <Details title="Email address" text={user?.data?.email ?? ""} />
            <Details title="Phone number" text={user?.data?.phone ?? ""} />
            <Details title="Status" text={getStatusChip()} />
            <Details
              title="Date added"
              text={moment(user?.data?.createdAt).format("DD MMM YYYY")}
            />
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
                    Assignment
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Activation
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-medium">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AvatarText
                      text={
                        manager?.center && typeof manager.center !== "string"
                          ? manager.center.name
                          : ""
                      }
                    />
                  </td>
                  <td className="px-6 py-4">
                    {manager?.center && typeof manager.center !== "string"
                      ? formatCenterAddress(manager.center)
                      : ""}
                  </td>
                  <td className="px-6 py-4 min-w-[240px]">
                    <Stack gap={1.5}>
                      <Select
                        placeholder={
                          currentCenterId ? "Change center" : "Select center"
                        }
                        value={selectedCenterId || currentCenterId || null}
                        onChange={(_, value) => setSelectedCenterId(value)}
                      >
                        {centerOptions.map((center) => (
                          <Option key={center._id} value={center._id}>
                            {center.name}
                          </Option>
                        ))}
                      </Select>
                      <Stack direction="row" gap={1} flexWrap="wrap">
                        <AppButton
                          loading={assignmentLoading}
                          disabled={assignmentLoading || !selectedCenterId}
                          onClick={() =>
                            handleAssignment(
                              selectedCenterId || currentCenterId || null,
                            )
                          }
                        >
                          {currentCenterId ? "Reassign" : "Assign"}
                        </AppButton>
                        <AppButton
                          variant="outlined"
                          disabled={assignmentLoading || !currentCenterId}
                          onClick={() => handleAssignment(null)}
                        >
                          Unassign
                        </AppButton>
                      </Stack>
                    </Stack>
                  </td>
                  <td className="px-6 py-4">
                    <Stack direction="row" gap={1} flexWrap="wrap">
                      {manager?.deactivated ? (
                        <AppButton
                          loading={deactivationLoading}
                          disabled={deactivationLoading}
                          onClick={() => handleDeactivation(false)}
                        >
                          Reactivate
                        </AppButton>
                      ) : (
                        <AppButton
                          className="bg-red-700"
                          loading={deactivationLoading}
                          disabled={deactivationLoading}
                          onClick={() => handleDeactivation(true)}
                        >
                          Deactivate
                        </AppButton>
                      )}
                    </Stack>
                  </td>
                  <td className="px-6 py-4">
                    <AppButton
                      onClick={() => handleAssignment(null)}
                      className="bg-red-700"
                      disabled={!currentCenterId || assignmentLoading}
                      loading={assignmentLoading}
                    >
                      Remove Center
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

const Details = ({ title, text }: { title: string; text: React.ReactNode }) => {
  return (
    <div className="flex justify-between gap-1 items-center flex-wrap">
      <Typography level="body-md" textColor={"#000000"}>
        {title}
      </Typography>
      <Typography level="body-sm">{text}</Typography>
    </div>
  );
};
