import { useMemo, useState } from "react";
import Frame from "../../components/frame/Frame";
import { Card, Chip, Option, Select, Stack, Typography } from "@mui/joy";
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
import { PulseLoader } from "react-spinners";

const CenterManager = () => {
  const { id } = useParams();
  const {
    data: user,
    isLoading,
    isFetching,
  } = useGetUserQuery(id ?? "", { skip: !id });
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
  const currentCenter =
    manager?.center && typeof manager.center !== "string"
      ? manager.center
      : null;

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
      <div className="mt-8 pb-8">
        <Card variant="outlined">
          {isLoading || isFetching ? (
            <div className="flex min-h-72 items-center justify-center">
              <PulseLoader className="mx-auto" size="large" />
            </div>
          ) : manager ? (
            <div className="grid md:grid-cols-3 gap-6 p-2">
              <div className="md:col-span-1">
                <div className="rounded-lg overflow-hidden bg-white border border-[#E7EAF0]">
                  <div className="h-72 overflow-hidden">
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
                </div>
              </div>

              <div className="md:col-span-2 rounded-lg border border-[#E7EAF0] bg-white p-5">
                <Typography level="h3" mb={3}>
                  {getUserFullName(manager)}
                </Typography>

                <Stack spacing={2}>
                  <DetailRow label="Email" value={manager.email || "N/A"} />
                  <DetailRow label="Phone" value={manager.phone || "N/A"} />
                  <DetailRow
                    label="Status"
                    value={getStatusChip()}
                    valueIsNode
                  />
                  <DetailRow
                    label="Center"
                    value={currentCenter?.name || "Unassigned"}
                  />
                  <DetailRow
                    label="Center Address"
                    value={formatCenterAddress(currentCenter)}
                  />
                  <DetailRow
                    label="Date Added"
                    value={
                      manager.createdAt
                        ? moment(manager.createdAt).format("DD MMM YYYY")
                        : "N/A"
                    }
                  />
                </Stack>

                <div className="mt-6 pt-4 border-t border-[#E7EAF0]">
                  <Typography level="title-md" mb={2}>
                    Center Assignment
                  </Typography>
                  <Stack gap={1.5}>
                    <Select
                      placeholder={
                        currentCenterId ? "Select new center" : "Select center"
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
                        {currentCenterId ? "Reassign Center" : "Assign Center"}
                      </AppButton>
                      <AppButton
                        variant="outlined"
                        disabled={assignmentLoading || !currentCenterId}
                        onClick={() => handleAssignment(null)}
                      >
                        Unassign Center
                      </AppButton>
                    </Stack>
                  </Stack>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E7EAF0]">
                  <Typography level="title-md" mb={2}>
                    Account Access
                  </Typography>
                  {manager?.deactivated ? (
                    <AppButton
                      loading={deactivationLoading}
                      disabled={deactivationLoading}
                      onClick={() => handleDeactivation(false)}
                    >
                      Reactivate Coordinator
                    </AppButton>
                  ) : (
                    <AppButton
                      className="bg-red-700"
                      loading={deactivationLoading}
                      disabled={deactivationLoading}
                      onClick={() => handleDeactivation(true)}
                    >
                      Deactivate Coordinator
                    </AppButton>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-72 items-center justify-center">
              <Typography level="body-md">Coordinator not found.</Typography>
            </div>
          )}
        </Card>
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

const DetailRow = ({
  label,
  value,
  valueIsNode = false,
}: {
  label: string;
  value: React.ReactNode;
  valueIsNode?: boolean;
}) => {
  return (
    <div className="flex justify-between gap-4 items-center border-b pb-2">
      <Typography level="body-sm" textColor={"#000000"}>
        {label}
      </Typography>
      {valueIsNode ? (
        <div>{value}</div>
      ) : (
        <Typography level="body-sm" textAlign={"right"}>
          {value}
        </Typography>
      )}
    </div>
  );
};
