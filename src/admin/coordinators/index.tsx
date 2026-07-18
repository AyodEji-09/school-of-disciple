import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Dropdown,
  FormControl,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  Option,
  Select,
  Stack,
} from "@mui/joy";
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
import AppPagination from "../../components/pagination/Pagination";

const Coordinators = () => {
  const navigate = useNavigate();
  const [searchVar, setSearchVar] = useState("");
  const [filter, setFilter] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const prevFiltersRef = useRef({ searchVar, filter });
  const [resendInviteId, setResendInviteId] = useState<string | null>(null);
  const [deleteInviteId, setDeleteInviteId] = useState<string | null>(null);

  useEffect(() => {
    const prev = prevFiltersRef.current;
    if (prev.searchVar !== searchVar || prev.filter !== filter) {
      prevFiltersRef.current = { searchVar, filter };
      setSearchParams(prevParams => {
        const next = new URLSearchParams(prevParams);
        next.delete("page");
        return next;
      });
    }
  }, [searchVar, filter]);

  const {
    data: coordinators,
    isLoading,
    refetch,
  } = useGetUsersQuery({
    type: "coordinator",
    page,
    ...(searchVar ? { search: searchVar } : {}),
    ...(filter ? { coordinatorStatus: filter } : {}),
  });
  const coordinatorDocs = coordinators?.data?.docs || [];
  const totalItems = coordinators?.data?.totalItems ?? 0;
  const totalPages = Math.ceil(totalItems / 20);

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (newPage <= 1) {
        next.delete("page");
      } else {
        next.set("page", String(newPage));
      }
      return next;
    });
  };

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
          subtitle={`${totalItems} coordinator${totalItems === 1 ? "" : "s"} on file`}
          action={
            <Stack direction="row" gap={1.5} alignItems="center">
              <AppSearch searchVar={searchVar} setSearchVar={setSearchVar} />
              {/* <FormControl size="sm" sx={{ minWidth: 160 }}>
                <Select
                  size="sm"
                  value={filter}
                  onChange={(_, val) => setFilter((val as string) ?? "")}
                  placeholder="All statuses"
                >
                  <Option value="">All statuses</Option>
                  <Option value="assigned">Assigned</Option>
                  <Option value="unassigned">Unassigned</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="deactivated">Deactivated</Option>
                </Select>
              </FormControl> */}
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
                  <TableHeaderCell className="text-right">
                    Action
                  </TableHeaderCell>
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
                        {getCenterName(coordinator) ?? (
                          <EmptyValue>Unassigned</EmptyValue>
                        )}
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
                              {/* {getActionLabel(coordinator)} */}
                              View
                            </MenuItem>
                            {getCoordinatorStatus(coordinator) ===
                              "pending" && (
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

          {totalPages > 1 && (
            <Stack direction="row" justifyContent="center" sx={{ p: 3 }}>
              <AppPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </Stack>
          )}
        </PageCard>
      </div>
    </Frame>
  );
};

export default Coordinators;
