import {
  Box,
  Button,
  Chip,
  CircularProgress,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
  Sheet,
  Stack,
  Table,
  Textarea,
  Typography,
} from "@mui/joy";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import DefaultHeader from "../../components/default-header/DefaultHeader";
import AppPagination from "../../components/pagination/Pagination";
import SearchableSelect from "../../components/input/SearchableSelect";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import {
  useGetSessionsQuery,
  useGetYearsQuery,
} from "../../data/rtk/academic";
import { useGetAllCenterQuery } from "../../data/rtk/center";
import {
  type ExamAppointment,
  useApproveAppointmentMutation,
  useCancelAppointmentMutation,
  useCreateAppointmentMutation,
  useGetAppointmentsQuery,
  useGetAppointmentsSummaryQuery,
  useRescheduleAppointmentMutation,
} from "../../data/rtk/appointment";
import { APPOINTMENT_STATUS, resolveStatus } from "../../utils/status";
import { capitalizeWords, handleError } from "../../utils";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
  { value: "rescheduled", label: "Rescheduled (Confirmed)" },
  { value: "cancelled", label: "Cancelled" },
];

const splitIsoToDateAndTime = (iso?: string | null) => {
  if (!iso) {
    return {
      date: moment().add(1, "days").format("YYYY-MM-DD"),
      time: "10:00",
    };
  }
  const m = moment(iso);
  if (!m.isValid()) {
    return {
      date: moment().add(1, "days").format("YYYY-MM-DD"),
      time: "10:00",
    };
  }
  return {
    date: m.format("YYYY-MM-DD"),
    time: m.format("HH:mm"),
  };
};

const combineDateAndTimeToIso = (dateStr: string, timeStr: string) => {
  const combined = moment(`${dateStr} ${timeStr || "09:00"}`, "YYYY-MM-DD HH:mm");
  return combined.toISOString();
};

const ExamAppointmentsPage = () => {
  const user = useAppSelector(selectUser);
  const isAdmin = user?.type === "admin" || user?.type === "super";
  const isCoordinator = user?.type === "coordinator";

  const [page, setPage] = useState(1);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedCenterId, setSelectedCenterId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Create Modal state (Coordinator)
  const [createOpen, setCreateOpen] = useState(false);
  const [formSessionId, setFormSessionId] = useState<string>("");
  const [formYearId, setFormYearId] = useState<string>("");
  const [formDate, setFormDate] = useState<string>(
    moment().add(1, "days").format("YYYY-MM-DD"),
  );
  const [formTime, setFormTime] = useState<string>("10:00");
  const [formDescription, setFormDescription] = useState<string>("");

  // Cancel Modal state (Admin)
  const [cancelTarget, setCancelTarget] = useState<ExamAppointment | null>(
    null,
  );
  const [cancelReason, setCancelReason] = useState<string>("");

  // Reschedule Modal state (Admin & Coordinator)
  const [rescheduleTarget, setRescheduleTarget] =
    useState<ExamAppointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>("");
  const [rescheduleTime, setRescheduleTime] = useState<string>("10:00");
  const [rescheduleReason, setRescheduleReason] = useState<string>("");

  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Academic Sessions & Years for Filter
  const { data: sessionsData } = useGetSessionsQuery();
  const sessions = sessionsData?.data ?? [];

  useEffect(() => {
    if (sessions.length && !selectedSessionId) {
      const current = sessions.find((s) => s.isCurrent) ?? sessions[0];
      setSelectedSessionId(current._id);
      setFormSessionId(current._id);
    }
  }, [sessions, selectedSessionId]);

  const { data: filterYearsData } = useGetYearsQuery(
    { sessionId: selectedSessionId },
    { skip: !selectedSessionId },
  );
  const filterYears = filterYearsData?.data ?? [];

  const { data: formYearsData, isFetching: loadingFormYears } =
    useGetYearsQuery({ sessionId: formSessionId }, { skip: !formSessionId });
  const formYears = formYearsData?.data ?? [];

  useEffect(() => {
    if (formYears.length && !formYearId) {
      const currentYr = formYears.find((y) => y.isCurrent) ?? formYears[0];
      setFormYearId(currentYr._id);
    }
  }, [formYears, formYearId]);

  // Centers for Admin Filter
  const { data: centersData } = useGetAllCenterQuery(
    { page: null },
    { skip: !isAdmin },
  );
  const centersList = centersData?.data?.docs ?? [];
  const centerOptions = useMemo(
    () => [
      { value: "", label: "All Centres" },
      ...centersList.map((c) => ({ value: c._id, label: c.name })),
    ],
    [centersList],
  );

  // Appointments Query & Summary
  const {
    data: appointmentsRes,
    isLoading,
    isFetching,
  } = useGetAppointmentsQuery({
    page,
    limit: 15,
    sessionId: selectedSessionId || undefined,
    yearId: selectedYearId || undefined,
    centerId: isAdmin && selectedCenterId ? selectedCenterId : undefined,
    status: statusFilter || undefined,
  });

  const { data: summaryRes } = useGetAppointmentsSummaryQuery({
    sessionId: selectedSessionId || undefined,
    yearId: selectedYearId || undefined,
    centerId: isAdmin && selectedCenterId ? selectedCenterId : undefined,
  });

  const appointments = appointmentsRes?.data?.docs ?? [];
  const totalPages = appointmentsRes?.data?.totalPages ?? 1;
  const summary = summaryRes?.data ?? {
    total: 0,
    pending: 0,
    approved: 0,
    rescheduled: 0,
    cancelled: 0,
  };

  const [createAppointment, { isLoading: isCreating }] =
    useCreateAppointmentMutation();
  const [approveAppointment] = useApproveAppointmentMutation();
  const [cancelAppointment, { isLoading: isCancelling }] =
    useCancelAppointmentMutation();
  const [rescheduleAppointment, { isLoading: isRescheduling }] =
    useRescheduleAppointmentMutation();

  const handleOpenCreate = () => {
    const defaultSession =
      selectedSessionId ||
      sessions.find((s) => s.isCurrent)?._id ||
      sessions[0]?._id ||
      "";
    setFormSessionId(defaultSession);
    setFormYearId("");
    setFormDate(moment().add(1, "days").format("YYYY-MM-DD"));
    setFormTime("10:00");
    setFormDescription("");
    setCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formYearId) {
      toast.error("Please select an academic year");
      return;
    }
    if (!formDate || !formTime) {
      toast.error("Please select both a date and time for the exam");
      return;
    }
    if (!formDescription.trim()) {
      toast.error("Please describe what the appointment is about");
      return;
    }

    try {
      const scheduledDate = combineDateAndTimeToIso(formDate, formTime);
      await createAppointment({
        sessionId: formSessionId || undefined,
        yearId: formYearId,
        scheduledDate,
        description: formDescription.trim(),
      }).unwrap();
      toast.success(
        "Exam appointment scheduled! The administrator has been notified.",
      );
      setCreateOpen(false);
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  const handleApprove = async (appt: ExamAppointment) => {
    setApprovingId(appt._id);
    try {
      await approveAppointment(appt._id).unwrap();
      toast.success("Appointment approved and coordinator notified");
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setApprovingId(null);
    }
  };

  const handleOpenCancel = (appt: ExamAppointment) => {
    setCancelTarget(appt);
    setCancelReason("");
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelTarget) return;
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancelling this appointment");
      return;
    }

    try {
      await cancelAppointment({
        id: cancelTarget._id,
        reason: cancelReason.trim(),
      }).unwrap();
      toast.success("Appointment cancelled and coordinator notified");
      setCancelTarget(null);
      setCancelReason("");
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  const handleOpenReschedule = (appt: ExamAppointment) => {
    const { date, time } = splitIsoToDateAndTime(appt.scheduledDate);
    setRescheduleTarget(appt);
    setRescheduleDate(date);
    setRescheduleTime(time);
    setRescheduleReason("");
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget) return;
    if (!rescheduleDate || !rescheduleTime) {
      toast.error("Please select both a new date and time");
      return;
    }

    try {
      const scheduledDate = combineDateAndTimeToIso(
        rescheduleDate,
        rescheduleTime,
      );
      await rescheduleAppointment({
        id: rescheduleTarget._id,
        scheduledDate,
        reason: rescheduleReason.trim() || undefined,
      }).unwrap();
      toast.success(
        isAdmin
          ? "Appointment rescheduled, confirmed, and coordinator notified"
          : "Appointment rescheduled and sent to admin for approval",
      );
      setRescheduleTarget(null);
      setRescheduleReason("");
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  return (
    <DefaultHeader title="Exam Appointments">
      <Stack gap={3}>
        {/* Header Bar */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          gap={2}
        >
          <Box>
            <Typography level="h3" sx={{ color: "#001F54" }}>
              Exam Appointments
            </Typography>
            <Typography level="body-sm" textColor="neutral.500">
              {isAdmin
                ? "Review, approve, reschedule, or cancel exam appointments scheduled by centre coordinators."
                : "Schedule exam dates for your centre and track approval status."}
            </Typography>
          </Box>

          {isCoordinator && (
            <Button
              onClick={handleOpenCreate}
              sx={{ bgcolor: "#001EC5", fontWeight: 600 }}
            >
              + Schedule Exam Appointment
            </Button>
          )}
        </Stack>

        {/* Summary Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          <Sheet
            variant="outlined"
            sx={{ p: 2.5, borderRadius: "md", bgcolor: "white" }}
          >
            <Typography level="body-xs" textColor="neutral.500" fontWeight={600}>
              TOTAL APPOINTMENTS
            </Typography>
            <Typography level="h3" sx={{ mt: 0.5, color: "#001F54" }}>
              {summary.total}
            </Typography>
          </Sheet>

          <Sheet
            variant="outlined"
            sx={{ p: 2.5, borderRadius: "md", bgcolor: "white" }}
          >
            <Typography level="body-xs" textColor="warning.600" fontWeight={600}>
              PENDING APPROVAL
            </Typography>
            <Typography level="h3" sx={{ mt: 0.5, color: "warning.700" }}>
              {summary.pending}
            </Typography>
          </Sheet>

          <Sheet
            variant="outlined"
            sx={{ p: 2.5, borderRadius: "md", bgcolor: "white" }}
          >
            <Typography level="body-xs" textColor="success.600" fontWeight={600}>
              CONFIRMED (APPROVED / RESCHEDULED)
            </Typography>
            <Typography level="h3" sx={{ mt: 0.5, color: "success.700" }}>
              {summary.approved + summary.rescheduled}
            </Typography>
          </Sheet>

          <Sheet
            variant="outlined"
            sx={{ p: 2.5, borderRadius: "md", bgcolor: "white" }}
          >
            <Typography level="body-xs" textColor="danger.600" fontWeight={600}>
              CANCELLED
            </Typography>
            <Typography level="h3" sx={{ mt: 0.5, color: "danger.700" }}>
              {summary.cancelled}
            </Typography>
          </Sheet>
        </Box>

        {/* Filters */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          gap={2}
          alignItems={{ xs: "stretch", md: "center" }}
          flexWrap="wrap"
        >
          <Select
            value={selectedSessionId}
            onChange={(_, val) => {
              if (val) {
                setSelectedSessionId(val);
                setSelectedYearId("");
                setPage(1);
              }
            }}
            placeholder="Select Session"
            sx={{ minWidth: 180, bgcolor: "white" }}
          >
            {sessions.map((s) => (
              <Option key={s._id} value={s._id}>
                {s.name} {s.isCurrent ? "(Current)" : ""}
              </Option>
            ))}
          </Select>

          <Select
            value={selectedYearId}
            onChange={(_, val) => {
              setSelectedYearId(val ?? "");
              setPage(1);
            }}
            placeholder="All Academic Years"
            sx={{ minWidth: 180, bgcolor: "white" }}
          >
            <Option value="">All Academic Years</Option>
            {filterYears.map((y) => (
              <Option key={y._id} value={y._id}>
                {y.name}
              </Option>
            ))}
          </Select>

          {isAdmin && (
            <SearchableSelect
              options={centerOptions}
              value={selectedCenterId}
              onChange={(val) => {
                setSelectedCenterId(val);
                setPage(1);
              }}
              placeholder="All Centres"
              sx={{ minWidth: 220, bgcolor: "white" }}
            />
          )}

          <Select
            value={statusFilter}
            onChange={(_, val) => {
              setStatusFilter(val ?? "");
              setPage(1);
            }}
            placeholder="All Status"
            sx={{ minWidth: 190, bgcolor: "white" }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Stack>

        {/* Appointments Table */}
        {isLoading || isFetching ? (
          <Stack alignItems="center" py={6}>
            <CircularProgress />
          </Stack>
        ) : (
          <Sheet
            variant="outlined"
            sx={{
              borderRadius: "md",
              overflow: "auto",
              bgcolor: "white",
            }}
          >
            <Table stickyHeader hoverRow>
              <thead>
                <tr>
                  {isAdmin && <th style={{ width: 200 }}>Centre / Coordinator</th>}
                  <th style={{ width: 150 }}>Academic Year</th>
                  <th style={{ width: 220 }}>Scheduled Date &amp; Time</th>
                  <th>Description &amp; Notes</th>
                  <th style={{ width: 170 }}>Status</th>
                  <th style={{ width: isAdmin ? 240 : 140 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => {
                  const statusEntry = resolveStatus(
                    APPOINTMENT_STATUS,
                    appt.status,
                  );
                  const coordinatorName = appt.coordinatorId
                    ? capitalizeWords(
                        `${appt.coordinatorId.firstName || ""} ${
                          appt.coordinatorId.lastName || ""
                        }`.trim(),
                      ) || appt.coordinatorId.email
                    : "—";

                  return (
                    <tr key={appt._id}>
                      {isAdmin && (
                        <td>
                          <Typography level="title-sm">
                            {appt.centerId?.name || "—"}
                          </Typography>
                          <Typography level="body-xs" textColor="neutral.500">
                            {coordinatorName}
                          </Typography>
                        </td>
                      )}

                      <td>
                        <Typography level="title-sm">
                          {appt.yearId?.name || "—"}
                        </Typography>
                        <Typography level="body-xs" textColor="neutral.500">
                          {appt.sessionId?.name || ""}
                        </Typography>
                      </td>

                      <td>
                        {appt.previousDate && (
                          <Typography
                            level="body-xs"
                            sx={{
                              textDecoration: "line-through",
                              color: "neutral.400",
                            }}
                          >
                            {moment(appt.previousDate).format(
                              "MMM D, YYYY • h:mm A",
                            )}
                          </Typography>
                        )}
                        <Typography level="title-sm" sx={{ color: "#001F54" }}>
                          {moment(appt.scheduledDate).format(
                            "ddd, MMM D, YYYY",
                          )}
                        </Typography>
                        <Typography level="body-xs" textColor="neutral.600">
                          {moment(appt.scheduledDate).format("h:mm A")}
                        </Typography>
                      </td>

                      <td>
                        <Typography
                          level="body-sm"
                          sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                        >
                          {appt.description}
                        </Typography>

                        {appt.status === "cancelled" &&
                          appt.cancellationReason && (
                            <Box
                              sx={{
                                mt: 1,
                                p: 1,
                                borderRadius: "sm",
                                bgcolor: "danger.50",
                                borderLeft: "3px solid",
                                borderColor: "danger.500",
                              }}
                            >
                              <Typography
                                level="body-xs"
                                fontWeight={600}
                                color="danger"
                              >
                                Cancellation Reason: {appt.cancellationReason}
                              </Typography>
                            </Box>
                          )}

                        {appt.rescheduleReason &&
                          appt.status !== "cancelled" && (
                            <Box
                              sx={{
                                mt: 1,
                                p: 1,
                                borderRadius: "sm",
                                bgcolor: "primary.50",
                                borderLeft: "3px solid",
                                borderColor: "primary.500",
                              }}
                            >
                              <Typography
                                level="body-xs"
                                fontWeight={600}
                                color="primary"
                              >
                                {appt.rescheduledBy === "coordinator"
                                  ? "Coordinator Reschedule Note: "
                                  : "Admin Reschedule Note: "}
                                {appt.rescheduleReason}
                              </Typography>
                            </Box>
                          )}
                      </td>

                      <td>
                        <Chip
                          size="sm"
                          variant="soft"
                          color={statusEntry.color}
                        >
                          {statusEntry.label}
                        </Chip>
                      </td>

                      <td>
                        <Stack direction="row" gap={1} flexWrap="wrap">
                          {isAdmin && appt.status === "pending" && (
                            <Button
                              size="sm"
                              color="success"
                              variant="solid"
                              loading={approvingId === appt._id}
                              onClick={() => handleApprove(appt)}
                            >
                              Approve
                            </Button>
                          )}

                          {(isAdmin ||
                            (isCoordinator && appt.status !== "cancelled")) && (
                            <Button
                              size="sm"
                              color="primary"
                              variant="outlined"
                              onClick={() => handleOpenReschedule(appt)}
                            >
                              Reschedule
                            </Button>
                          )}

                          {isAdmin && appt.status !== "cancelled" && (
                            <Button
                              size="sm"
                              color="danger"
                              variant="soft"
                              onClick={() => handleOpenCancel(appt)}
                            >
                              Cancel
                            </Button>
                          )}
                        </Stack>
                      </td>
                    </tr>
                  );
                })}

                {appointments.length === 0 && (
                  <tr>
                    <td
                      colSpan={isAdmin ? 6 : 5}
                      style={{ textAlign: "center", padding: 36 }}
                    >
                      <Typography level="body-sm" textColor="neutral.500">
                        No exam appointments found.
                      </Typography>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Sheet>
        )}

        {totalPages > 1 && (
          <AppPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </Stack>

      {/* Coordinator: Schedule New Exam Appointment Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)}>
        <ModalDialog sx={{ width: "100%", maxWidth: 500 }}>
          <ModalClose />
          <DialogTitle>Schedule Exam Appointment</DialogTitle>
          <Divider />
          <DialogContent>
            <form onSubmit={handleCreateSubmit}>
              <Stack gap={2} sx={{ mt: 1 }}>
                <FormControl required>
                  <FormLabel>Academic Session</FormLabel>
                  <Select
                    value={formSessionId}
                    onChange={(_, val) => {
                      if (val) {
                        setFormSessionId(val);
                        setFormYearId("");
                      }
                    }}
                  >
                    {sessions.map((s) => (
                      <Option key={s._id} value={s._id}>
                        {s.name} {s.isCurrent ? "(Current)" : ""}
                      </Option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl required>
                  <FormLabel>Academic Year</FormLabel>
                  <Select
                    value={formYearId}
                    disabled={loadingFormYears || formYears.length === 0}
                    placeholder={
                      loadingFormYears
                        ? "Loading academic years..."
                        : "Select Academic Year (e.g. Year 1, Year 2)"
                    }
                    onChange={(_, val) => setFormYearId(val ?? "")}
                  >
                    {formYears.map((y) => (
                      <Option key={y._id} value={y._id}>
                        {y.name}
                      </Option>
                    ))}
                  </Select>
                </FormControl>

                <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
                  <FormControl required sx={{ flex: 1 }}>
                    <FormLabel>Exam Date</FormLabel>
                    <Input
                      type="date"
                      value={formDate}
                      slotProps={{
                        input: {
                          min: moment().format("YYYY-MM-DD"),
                        },
                      }}
                      onChange={(e) => setFormDate(e.target.value)}
                    />
                  </FormControl>

                  <FormControl required sx={{ flex: 1 }}>
                    <FormLabel>Exam Time</FormLabel>
                    <Input
                      type="time"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                    />
                  </FormControl>
                </Stack>

                <FormControl required>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    minRows={3}
                    placeholder="Describe what this exam appointment is about (e.g. Final Exam for Year 1 students, venue/proctoring details)..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </FormControl>

                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  gap={1.5}
                  sx={{ mt: 1 }}
                >
                  <Button
                    variant="plain"
                    color="neutral"
                    onClick={() => setCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={isCreating}
                    sx={{ bgcolor: "#001EC5" }}
                  >
                    Schedule Appointment
                  </Button>
                </Stack>
              </Stack>
            </form>
          </DialogContent>
        </ModalDialog>
      </Modal>

      {/* Reschedule Modal (Admin & Coordinator) */}
      <Modal
        open={Boolean(rescheduleTarget)}
        onClose={() => setRescheduleTarget(null)}
      >
        <ModalDialog sx={{ width: "100%", maxWidth: 480 }}>
          <ModalClose />
          <DialogTitle>Reschedule Exam Appointment</DialogTitle>
          <Divider />
          <DialogContent>
            {rescheduleTarget && (
              <form onSubmit={handleRescheduleSubmit}>
                <Stack gap={2} sx={{ mt: 1 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "sm",
                      bgcolor: "neutral.50",
                      border: "1px solid",
                      borderColor: "neutral.200",
                    }}
                  >
                    <Typography level="title-sm">
                      {rescheduleTarget.centerId?.name} —{" "}
                      {rescheduleTarget.yearId?.name}
                    </Typography>
                    <Typography level="body-xs" textColor="neutral.600">
                      Current Date &amp; Time:{" "}
                      <strong>
                        {moment(rescheduleTarget.scheduledDate).format(
                          "ddd, MMM D, YYYY • h:mm A",
                        )}
                      </strong>
                    </Typography>
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
                    <FormControl required sx={{ flex: 1 }}>
                      <FormLabel>New Date</FormLabel>
                      <Input
                        type="date"
                        value={rescheduleDate}
                        slotProps={{
                          input: {
                            min: moment().format("YYYY-MM-DD"),
                          },
                        }}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                      />
                    </FormControl>

                    <FormControl required sx={{ flex: 1 }}>
                      <FormLabel>New Time</FormLabel>
                      <Input
                        type="time"
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                      />
                    </FormControl>
                  </Stack>

                  <FormControl>
                    <FormLabel>
                      {isAdmin
                        ? "Note / Reason for Coordinator (Optional)"
                        : "Reason for Rescheduling (Optional)"}
                    </FormLabel>
                    <Textarea
                      minRows={3}
                      placeholder={
                        isAdmin
                          ? "Explain why the exam date/time was moved..."
                          : "Let the administrator know why you are requesting a new date..."
                      }
                      value={rescheduleReason}
                      onChange={(e) => setRescheduleReason(e.target.value)}
                    />
                  </FormControl>

                  <Typography level="body-xs" textColor="neutral.500">
                    {isAdmin
                      ? "Rescheduling will immediately confirm the new date and notify the coordinator by email."
                      : "Rescheduling will submit the new date to the administrator for approval."}
                  </Typography>

                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    gap={1.5}
                    sx={{ mt: 1 }}
                  >
                    <Button
                      variant="plain"
                      color="neutral"
                      onClick={() => setRescheduleTarget(null)}
                    >
                      Close
                    </Button>
                    <Button
                      type="submit"
                      loading={isRescheduling}
                      sx={{ bgcolor: "#001EC5" }}
                    >
                      Confirm New Date
                    </Button>
                  </Stack>
                </Stack>
              </form>
            )}
          </DialogContent>
        </ModalDialog>
      </Modal>

      {/* Cancel Modal (Admin) */}
      <Modal open={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)}>
        <ModalDialog sx={{ width: "100%", maxWidth: 460 }}>
          <ModalClose />
          <DialogTitle>Cancel Exam Appointment</DialogTitle>
          <Divider />
          <DialogContent>
            {cancelTarget && (
              <form onSubmit={handleCancelSubmit}>
                <Stack gap={2} sx={{ mt: 1 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "sm",
                      bgcolor: "danger.50",
                      border: "1px solid",
                      borderColor: "danger.200",
                    }}
                  >
                    <Typography level="title-sm" color="danger">
                      {cancelTarget.centerId?.name} —{" "}
                      {cancelTarget.yearId?.name}
                    </Typography>
                    <Typography level="body-xs" textColor="neutral.700">
                      Scheduled:{" "}
                      {moment(cancelTarget.scheduledDate).format(
                        "ddd, MMM D, YYYY • h:mm A",
                      )}
                    </Typography>
                  </Box>

                  <FormControl required>
                    <FormLabel>Reason for Cancellation</FormLabel>
                    <Textarea
                      minRows={3}
                      placeholder="Provide a clear reason for cancelling this appointment (this will be sent to the coordinator)..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    />
                  </FormControl>

                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    gap={1.5}
                    sx={{ mt: 1 }}
                  >
                    <Button
                      variant="plain"
                      color="neutral"
                      onClick={() => setCancelTarget(null)}
                    >
                      Keep Appointment
                    </Button>
                    <Button
                      type="submit"
                      color="danger"
                      loading={isCancelling}
                    >
                      Cancel Appointment
                    </Button>
                  </Stack>
                </Stack>
              </form>
            )}
          </DialogContent>
        </ModalDialog>
      </Modal>
    </DefaultHeader>
  );
};

export default ExamAppointmentsPage;
