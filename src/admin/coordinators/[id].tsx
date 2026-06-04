import { useMemo, useState } from "react";
import Frame from "../../components/frame/Frame";
import { Box, Option, Select, Stack, Typography } from "@mui/joy";
import AppButton from "../../components/Button/AppButton";
import {
  useGetUserQuery,
  useUpdateCoordinatorAssignmentMutation,
  useUpdateCoordinatorDeactivationMutation,
} from "../../data/rtk/user";
import { useGetAllCenterQuery } from "../../data/rtk/center";
import { useParams } from "react-router-dom";
import { formatCenterAddress, getUserFullName, handleError } from "../../utils";
import moment from "moment";
import { toast } from "react-toastify";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import PageCard from "../../components/feedback/PageCard";
import StatusBadge from "../../components/feedback/StatusBadge";
import { PageLoader } from "../../components/query-state/QueryStates";
import { COORDINATOR_STATUS } from "../../utils/status";

const CenterManager = () => {
  const { id } = useParams();
  const viewer = useAppSelector(selectUser);
  const isAdmin = viewer?.type === "admin";

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

  const manager = user?.data;
  const personalInfo = manager?.intakeFormData?.personalInfo;
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

  const handleAssignment = async (centerId: string | null) => {
    if (!manager?._id) return;
    const action = centerId ? "assign" : "unassign";
    if (!window.confirm(`Are you sure you want to ${action} this center?`))
      return;

    setAssignmentLoading(true);
    try {
      const res = await updateAssignment({
        id: manager._id,
        centerId,
      }).unwrap();
      toast.success(res.data.message || "Coordinator updated successfully");
      if (centerId) setSelectedCenterId(centerId);
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleDeactivation = async (deactivated: boolean) => {
    if (!manager?._id) return;
    const action = deactivated ? "deactivate" : "reactivate";
    if (!window.confirm(`Are you sure you want to ${action} this coordinator?`))
      return;

    setDeactivationLoading(true);
    try {
      const res = await updateDeactivation({
        id: manager._id,
        deactivated,
      }).unwrap();
      toast.success(res.data.message || "Coordinator status updated");
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setDeactivationLoading(false);
    }
  };

  return (
    <Frame text="Coordinator Details">
      <div className="mt-6 pb-16">
        {isLoading || isFetching ? (
          <PageLoader label="Loading coordinator…" />
        ) : manager ? (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <PageCard padded={false} className="!p-0">
                <div className="h-72 overflow-hidden rounded-t-2xl">
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
              </PageCard>
            </div>

            <div className="md:col-span-2">
              <PageCard>
                <Typography level="h3" mb={3} sx={{ color: "#001F54" }}>
                  {getUserFullName(manager)}
                </Typography>

                <Stack spacing={4}>
                  <Box>
                    <Typography level="title-md" mb={2} color="primary">
                      Personal Information
                    </Typography>
                    <Stack spacing={1.5}>
                      <DetailRow label="Email" value={manager.email || "N/A"} />
                      <DetailRow label="Phone" value={manager.phone || "N/A"} />
                      <DetailRow
                        label="Address"
                        value={manager.address || "N/A"}
                      />
                      <DetailRow
                        label="Date of Birth"
                        value={
                          manager.birthday
                            ? moment(manager.birthday).format("MM/DD/YYYY")
                            : personalInfo?.dateOfBirth || "N/A"
                        }
                      />
                    </Stack>
                  </Box>

                  <Box>
                    <Typography level="title-md" mb={2} color="primary">
                      Center Assignment
                    </Typography>
                    <Stack spacing={1.5}>
                      <DetailRow
                        label="Status"
                        valueIsNode
                        value={
                          <StatusBadge
                            status={coordinatorStatus}
                            map={COORDINATOR_STATUS}
                          />
                        }
                      />
                      <DetailRow
                        label="Assigned Center"
                        value={currentCenter?.name || "Unassigned"}
                      />
                      <DetailRow
                        label="Center Address"
                        value={formatCenterAddress(currentCenter)}
                      />
                      <DetailRow
                        label="Assigned On"
                        value={
                          manager.coordinatorAssignedAt
                            ? moment(manager.coordinatorAssignedAt).format(
                                "MM/DD/YYYY",
                              )
                            : "N/A"
                        }
                      />
                      <DetailRow
                        label="Date Joined"
                        value={
                          manager.createdAt
                            ? moment(manager.createdAt).format("MM/DD/YYYY")
                            : "N/A"
                        }
                      />
                    </Stack>

                    {isAdmin && (
                      <div className="mt-6 p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                        <Typography level="title-sm" mb={2}>
                          Update Center Assignment
                        </Typography>
                        <Stack
                          direction="row"
                          gap={1.5}
                          flexWrap="wrap"
                          alignItems="center"
                        >
                          <Select
                            placeholder={
                              currentCenterId
                                ? "Select new center"
                                : "Select center"
                            }
                            value={selectedCenterId || currentCenterId || null}
                            onChange={(_, value) => setSelectedCenterId(value)}
                            className="min-w-[200px]"
                            sx={{ bgcolor: "white" }}
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
                              disabled={
                                assignmentLoading ||
                                !selectedCenterId ||
                                selectedCenterId === currentCenterId
                              }
                              onClick={() => handleAssignment(selectedCenterId)}
                            >
                              {currentCenterId ? "Reassign" : "Assign"}
                            </AppButton>
                            <AppButton
                              variant="outlined"
                              disabled={assignmentLoading || !currentCenterId}
                              onClick={() => handleAssignment(null)}
                              color="neutral"
                            >
                              Unassign
                            </AppButton>
                          </Stack>
                        </Stack>
                      </div>
                    )}
                  </Box>

                  {isAdmin && coordinatorStatus !== "pending" && (
                    <div className="mt-10 pt-6 border-t border-[#E7EAF0]">
                      <Typography level="title-md" mb={2}>
                        Administrative Actions
                      </Typography>
                      <Stack direction="row" gap={2}>
                        {manager?.deactivated ? (
                          <AppButton
                            loading={deactivationLoading}
                            disabled={deactivationLoading}
                            onClick={() => handleDeactivation(false)}
                            color="success"
                          >
                            Reactivate Coordinator Account
                          </AppButton>
                        ) : (
                          <AppButton
                            className="bg-red-700"
                            loading={deactivationLoading}
                            disabled={deactivationLoading}
                            onClick={() => handleDeactivation(true)}
                            color="danger"
                          >
                            Deactivate Coordinator Account
                          </AppButton>
                        )}
                      </Stack>
                    </div>
                  )}
                </Stack>
              </PageCard>
            </div>
          </div>
        ) : (
          <div className="flex min-h-72 items-center justify-center">
            <Typography level="body-md">Coordinator not found.</Typography>
          </div>
        )}
      </div>
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
    <div className="flex justify-between gap-4 items-center border-b border-[#F3F4F6] pb-2">
      <Typography
        level="body-sm"
        textColor="#475569"
        sx={{ fontWeight: 500 }}
      >
        {label}
      </Typography>
      {valueIsNode ? (
        <div>{value}</div>
      ) : (
        <Typography level="body-sm" textAlign="right" textColor="#001F54">
          {value as string}
        </Typography>
      )}
    </div>
  );
};
