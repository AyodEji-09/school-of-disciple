import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Dropdown, IconButton, Menu, MenuButton, MenuItem, Stack } from "@mui/joy";
import { MoreVert } from "@mui/icons-material";
import axios from "axios";

import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import AppSearch from "../../components/search/AppSearch";
import AvatarText from "../../components/avatar-text/AvatarText";
import PageCard from "../../components/feedback/PageCard";
import StatusBadge from "../../components/feedback/StatusBadge";
import {
  CenteredEmptyState,
  TableSkeleton,
} from "../../components/query-state/QueryStates";
import {
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  EmptyValue,
} from "../../components/feedback/TableShell";
import { useGetUsersQuery } from "../../data/rtk/user";
import { getUserFullName, handleError } from "../../utils";
import { COORDINATOR_STATUS } from "../../utils/status";

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
    if (!entry?.center || typeof entry.center === "string") return null;
    return entry.center.name || null;
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

  const getActionLabel = (entry: User) => {
    const status = getCoordinatorStatus(entry);
    if (status === "pending") return "Pending";
    if (status === "deactivated") return "Deactivated";
    if (status === "unassigned") return "Assign";
    return "View";
  };

  return (
    <Frame text="Coordinators">
      <div className="mt-6">
        <PageCard
          title="Center Coordinators"
          subtitle={`${coordinatorDocs.length} coordinator${coordinatorDocs.length === 1 ? "" : "s"} on file`}
          action={
            <Stack direction="row" gap={1.5} alignItems="center">
              <AppSearch searchVar={searchVar} setSearchVar={setSearchVar} />
              <AppButton
                type="button"
                onClick={() => navigate("/dashboard/coordinators/invite")}
              >
                Invite Coordinator
              </AppButton>
            </Stack>
          }
          padded={false}
        >
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left">
              <TableHeader>
                <tr>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Phone Number</TableHeaderCell>
                  <TableHeaderCell>Center</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell className="text-right">Action</TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {isLoading && coordinatorDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <TableSkeleton columns={6} rows={5} />
                    </td>
                  </tr>
                ) : coordinatorDocs.length ? (
                  coordinatorDocs.map((coordinator) => (
                    <TableRow key={coordinator._id}>
                      <TableCell>
                        <AvatarText text={getUserFullName(coordinator)} />
                      </TableCell>
                      <TableCell>{coordinator?.phone}</TableCell>
                      <TableCell>
                        {getCenterName(coordinator) ?? <EmptyValue>Unassigned</EmptyValue>}
                      </TableCell>
                      <TableCell>{coordinator?.email}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={getCoordinatorStatus(coordinator)}
                          map={COORDINATOR_STATUS}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Dropdown>
                          <MenuButton
                            slots={{ root: IconButton }}
                            slotProps={{
                              root: {
                                variant: "outlined",
                                color: "neutral",
                                size: "sm",
                              },
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
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <CenteredEmptyState description="No coordinators found" />
                    </td>
                  </tr>
                )}
              </TableBody>
            </table>
          </div>
        </PageCard>
      </div>
    </Frame>
  );
};

export default Coordinators;
