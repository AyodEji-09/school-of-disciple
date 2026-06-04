import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Chip,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  Stack,
  Typography,
} from "@mui/joy";
import { MoreVert } from "@mui/icons-material";
import axios from "axios";

import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import AppSearch from "../../components/search/AppSearch";
import AvatarText from "../../components/avatar-text/AvatarText";
import {
  CenteredEmptyState,
  TableSkeleton,
} from "../../components/query-state/QueryStates";
import { useGetUsersQuery } from "../../data/rtk/user";
import { getUserFullName, handleError } from "../../utils";

const Coordinators = () => {
  const navigate = useNavigate();
  const [searchVar, setSearchVar] = useState("");
  const [resendInviteId, setResendInviteId] = useState<string | null>(null);
  const [deleteInviteId, setDeleteInviteId] = useState<string | null>(null);

  const {
    data: coordinators,
    isLoading,
    refetch,
  } = useGetUsersQuery({
    type: "coordinator",
    ...(searchVar ? { search: searchVar } : {}),
  });
  const coordinatorDocs = coordinators?.data?.docs || [];

  const getCenterName = (entry: User) => {
    if (!entry?.center || typeof entry.center === "string") return "-";
    return entry.center.name || "-";
  };

  const getCoordinatorStatus = (entry: User) => {
    if (entry.coordinatorStatus) return entry.coordinatorStatus;
    if (!entry.emailVerified) return "pending";
    if (entry.deactivated) return "deactivated";
    if (!entry.center) return "unassigned";
    return "assigned";
  };

  const getCenterId = (entry: User) => {
    if (!entry?.center) return null;
    if (typeof entry.center === "string") return entry.center;
    return entry.center._id;
  };

  const resendInvite = async (entry: User) => {
    const centerId = getCenterId(entry);
    if (!entry?.email || !centerId) {
      toast.error("Coordinator email or center is missing");
      return;
    }

    setResendInviteId(entry._id);
    try {
      const res = await axios.post<ApiResponseN<null>>(
        "/admin/invite-coordinator",
        {
          email: entry.email,
          centerId,
          firstName: entry.firstName,
          lastName: entry.lastName,
        },
      );
      toast.success(res.data.message || "Invite resent successfully");
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setResendInviteId(null);
    }
  };

  const handleDeleteInvite = async (entry: User) => {
    if (!entry?._id) return;
    if (!window.confirm("Are you sure you want to delete this invite?")) return;

    setDeleteInviteId(entry._id);
    try {
      await axios.delete(`/admin/invite-coordinator/${entry._id}`);
      toast.success("Invite deleted successfully");
      refetch();
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setDeleteInviteId(null);
    }
  };

  const getStatusChip = (
    status: "assigned" | "unassigned" | "deactivated" | "pending",
  ) => {
    const config = {
      assigned: { color: "success" as const, label: "Assigned" },
      unassigned: { color: "warning" as const, label: "Unassigned" },
      deactivated: { color: "danger" as const, label: "Deactivated" },
      pending: { color: "neutral" as const, label: "Pending Invite" },
    };

    return (
      <Chip color={config[status].color} variant="soft" size="sm">
        {config[status].label}
      </Chip>
    );
  };

  const getActionLabel = (entry: User) => {
    const status = getCoordinatorStatus(entry);
    if (status === "pending") return "Pending";
    if (status === "deactivated") return "Deactivated";
    if (status === "unassigned") return "Assign";
    return "View";
  };

  return (
    <Frame text="Coordinators">
      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        <AppButton
          variant="outlined"
          onClick={() => navigate("/dashboard/coordinators/invite")}
        >
          Invite Coordinator
        </AppButton>
      </div>
      <div className="mt-8 pb-16">
        <div className="bg-white p-4 overflow-x-auto">
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
            gap={4}
          >
            <Typography level="title-lg" mb={4}>
              Center Coordinators
            </Typography>
            <AppSearch searchVar={searchVar} setSearchVar={setSearchVar} />
          </Stack>
          <div className={"overflow-x-auto w-full"}>
            <table className="w-full text-sm text-left rtl:text-right text-[#001F54]">
              <thead className="text-xs whitespace-nowrap">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Phone Number
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Center
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="whitespace-nowrap">
                {isLoading && coordinatorDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <TableSkeleton columns={6} rows={5} />
                    </td>
                  </tr>
                ) : coordinatorDocs.length ? (
                  coordinatorDocs.map((coordinator, idx) => (
                    <tr
                      className="border-b last:border-none font-medium"
                      key={idx}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <AvatarText text={getUserFullName(coordinator)} />
                      </td>
                      <td className="px-6 py-4">{coordinator?.phone}</td>
                      <td className="px-6 py-4">{getCenterName(coordinator)}</td>
                      <td className="px-6 py-4">{coordinator?.email}</td>
                      <td className="px-6 py-4">
                        {getStatusChip(getCoordinatorStatus(coordinator))}
                      </td>
                      <td className="px-6 py-4">
                        <Dropdown>
                          <MenuButton
                            slots={{ root: IconButton }}
                            slotProps={{
                              root: { variant: "outlined", color: "neutral" },
                            }}
                          >
                            <MoreVert />
                          </MenuButton>
                          <Menu>
                            <MenuItem
                              onClick={() =>
                                navigate(
                                  `/dashboard/coordinators/${coordinator._id}`,
                                )
                              }
                            >
                              {getActionLabel(coordinator)}
                            </MenuItem>
                            {getCoordinatorStatus(coordinator) === "pending" && (
                              <>
                                <MenuItem
                                  onClick={() => resendInvite(coordinator)}
                                  disabled={resendInviteId === coordinator._id}
                                >
                                  {resendInviteId === coordinator._id
                                    ? "Resending..."
                                    : "Resend Invite"}
                                </MenuItem>
                                <MenuItem
                                  onClick={() =>
                                    handleDeleteInvite(coordinator)
                                  }
                                  disabled={deleteInviteId === coordinator._id}
                                  variant="soft"
                                  color="danger"
                                >
                                  {deleteInviteId === coordinator._id
                                    ? "Deleting..."
                                    : "Delete Invite"}
                                </MenuItem>
                              </>
                            )}
                          </Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <CenteredEmptyState description="No coordinators found" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Frame>
  );
};

export default Coordinators;
