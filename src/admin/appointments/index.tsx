import {
  Box,
  Button,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
  Skeleton,
  Stack,
  Textarea,
  Typography,
} from "@mui/joy";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ViewAgendaOutlinedIcon from "@mui/icons-material/ViewAgendaOutlined";
import ViewWeekOutlinedIcon from "@mui/icons-material/ViewWeekOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
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
  type AppointmentStatus,
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
import AppointyDateTimePicker from "./AppointyDateTimePicker";

const STATUS_STYLE: Record<
  AppointmentStatus,
  { dot: string; bg: string; border: string; text: string }
> = {
  pending: {
    dot: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    text: "#92400E",
  },
  approved: {
    dot: "#16A34A",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    text: "#065F46",
  },
  rescheduled: {
    dot: "#001EC5",
    bg: "#EEF2FF",
    border: "#C7D2FE",
    text: "#1E3A8A",
  },
  cancelled: {
    dot: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    text: "#991B1B",
  },
};

const WEEKDAYS_LONG = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  const combined = moment(
    `${dateStr} ${timeStr || "09:00"}`,
    "YYYY-MM-DD HH:mm",
  );
  return combined.toISOString();
};

const formatRelativeDayBadge = (dateStr: string) => {
  const today = moment().format("YYYY-MM-DD");
  const tomorrow = moment().add(1, "days").format("YYYY-MM-DD");
  if (dateStr === today) return "Today";
  if (dateStr === tomorrow) return "Tomorrow";
  return null;
};

const ExamAppointmentsPage = () => {
  const user = useAppSelector(selectUser);
  const isAdmin = user?.type === "admin" || user?.type === "super";
  const isCoordinator = user?.type === "coordinator";

  const [viewMode, setViewMode] = useState<"agenda" | "week" | "month">(
    "agenda",
  );
  const [anchorDate, setAnchorDate] = useState(() => moment());
  const [focusedDate, setFocusedDate] = useState<string>("");

  const [page, setPage] = useState(1);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedCenterId, setSelectedCenterId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Detail Drawer
  const [inspectId, setInspectId] = useState<string | null>(null);

  // Create Modal (Coordinator)
  const [createOpen, setCreateOpen] = useState(false);
  const [formSessionId, setFormSessionId] = useState<string>("");
  const [formYearId, setFormYearId] = useState<string>("");
  const [formDate, setFormDate] = useState<string>(
    moment().add(1, "days").format("YYYY-MM-DD"),
  );
  const [formTime, setFormTime] = useState<string>("10:00");
  const [formDescription, setFormDescription] = useState<string>("");

  // Reschedule Modal (Admin & Coordinator)
  const [rescheduleTarget, setRescheduleTarget] =
    useState<ExamAppointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>("");
  const [rescheduleTime, setRescheduleTime] = useState<string>("10:00");
  const [rescheduleReason, setRescheduleReason] = useState<string>("");

  // Cancel Modal (Admin)
  const [cancelTarget, setCancelTarget] = useState<ExamAppointment | null>(
    null,
  );
  const [cancelReason, setCancelReason] = useState<string>("");

  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Academic Sessions & Years
  const { data: sessionsData = [] } = useGetSessionsQuery();
  const sessions = Array.isArray(sessionsData) ? sessionsData : [];

  useEffect(() => {
    if (sessions.length && !selectedSessionId) {
      const current = sessions.find((s) => s.isCurrent) ?? sessions[0];
      setSelectedSessionId(current._id);
      setFormSessionId(current._id);
    }
  }, [sessions, selectedSessionId]);

  const { data: filterYearsData = [] } = useGetYearsQuery(
    { sessionId: selectedSessionId },
    { skip: !selectedSessionId },
  );
  const filterYears = Array.isArray(filterYearsData) ? filterYearsData : [];

  const { data: formYearsData = [], isFetching: loadingFormYears } =
    useGetYearsQuery({ sessionId: formSessionId }, { skip: !formSessionId });
  const formYears = Array.isArray(formYearsData) ? formYearsData : [];

  useEffect(() => {
    if (formYears.length && !formYearId) {
      const currentYr = formYears.find((y) => y.isCurrent) ?? formYears[0];
      setFormYearId(currentYr._id);
    }
  }, [formYears, formYearId]);

  // Centers for Admin Filter
  const { data: centersData } = useGetAllCenterQuery(undefined, {
    skip: !isAdmin,
  });
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
    limit: viewMode === "agenda" && !focusedDate ? 15 : 50,
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

  const inspectedAppointment = useMemo(
    () =>
      inspectId ? appointments.find((a) => a._id === inspectId) ?? null : null,
    [inspectId, appointments],
  );

  // Group appointments chronologically by YYYY-MM-DD
  const appointmentsByDate = useMemo(() => {
    const groups = new Map<string, ExamAppointment[]>();
    const sorted = [...appointments].sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() -
        new Date(b.scheduledDate).getTime(),
    );
    for (const appt of sorted) {
      const key = moment(appt.scheduledDate).format("YYYY-MM-DD");
      const list = groups.get(key) ?? [];
      list.push(appt);
      groups.set(key, list);
    }
    return groups;
  }, [appointments]);

  const agendaGroups = useMemo(() => {
    const entries = Array.from(appointmentsByDate.entries());
    if (focusedDate) {
      return entries.filter(([dateKey]) => dateKey === focusedDate);
    }
    return entries;
  }, [appointmentsByDate, focusedDate]);

  const weekDays = useMemo(() => {
    const startOfWeek = anchorDate.clone().startOf("week");
    return Array.from({ length: 7 }, (_, i) => {
      const d = startOfWeek.clone().add(i, "days");
      return {
        dateStr: d.format("YYYY-MM-DD"),
        dayShort: d.format("ddd"),
        dayNum: d.format("D"),
        monthShort: d.format("MMM"),
      };
    });
  }, [anchorDate]);

  const monthCells = useMemo(() => {
    const startOfMonth = anchorDate.clone().startOf("month");
    const endOfMonth = anchorDate.clone().endOf("month");
    const startOffset = startOfMonth.day();
    const totalDays = endOfMonth.date();
    const cells: Array<{ dateStr: string; dayNum: number } | null> = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) {
      const current = startOfMonth.clone().date(d);
      cells.push({ dateStr: current.format("YYYY-MM-DD"), dayNum: d });
    }
    return cells;
  }, [anchorDate]);

  const statusFilters = [
    { value: "", label: "All Appointments", count: summary.total, dot: "#001F54" },
    { value: "pending", label: "Pending Approval", count: summary.pending, dot: "#D97706" },
    { value: "approved", label: "Approved", count: summary.approved, dot: "#16A34A" },
    { value: "rescheduled", label: "Rescheduled", count: summary.rescheduled, dot: "#001EC5" },
    { value: "cancelled", label: "Cancelled", count: summary.cancelled, dot: "#DC2626" },
  ];

  const todayStr = moment().format("YYYY-MM-DD");

  const handleStepPeriod = (dir: -1 | 1) => {
    if (viewMode === "week") {
      setAnchorDate(anchorDate.clone().add(dir, "weeks"));
    } else if (viewMode === "month") {
      setAnchorDate(anchorDate.clone().add(dir, "months"));
    }
  };

  const handleToday = () => {
    const now = moment();
    setAnchorDate(now);
    if (viewMode === "agenda") {
      setFocusedDate(now.format("YYYY-MM-DD"));
    }
  };

  const handleOpenCreate = (prefillDate?: string) => {
    const defaultSession =
      selectedSessionId ||
      sessions.find((s) => s.isCurrent)?._id ||
      sessions[0]?._id ||
      "";
    setFormSessionId(defaultSession);
    setFormYearId("");
    const chosenDate =
      prefillDate && prefillDate >= todayStr
        ? prefillDate
        : focusedDate && focusedDate >= todayStr
          ? focusedDate
          : moment().add(1, "days").format("YYYY-MM-DD");
    setFormDate(chosenDate);
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

  const handleApprove = async (
    appt: ExamAppointment,
    e?: React.MouseEvent,
  ) => {
    e?.stopPropagation();
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

  const handleOpenReschedule = (
    appt: ExamAppointment,
    e?: React.MouseEvent,
  ) => {
    e?.stopPropagation();
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

  const handleOpenCancel = (
    appt: ExamAppointment,
    e?: React.MouseEvent,
  ) => {
    e?.stopPropagation();
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

  const getToolbarTitle = () => {
    if (viewMode === "week") {
      const start = anchorDate.clone().startOf("week");
      const end = anchorDate.clone().endOf("week");
      return start.month() === end.month()
        ? `${start.format("MMM D")} – ${end.format("D, YYYY")}`
        : `${start.format("MMM D")} – ${end.format("MMM D, YYYY")}`;
    }
    if (viewMode === "month") {
      return anchorDate.format("MMMM YYYY");
    }
    if (focusedDate) {
      return moment(focusedDate, "YYYY-MM-DD").format("dddd, MMM D, YYYY");
    }
    return "All Scheduled Exams";
  };

  const renderAgendaRow = (appt: ExamAppointment) => {
    const statusEntry = resolveStatus(APPOINTMENT_STATUS, appt.status);
    const palette = STATUS_STYLE[appt.status] ?? STATUS_STYLE.rescheduled;
    const coordinatorName = appt.coordinatorId
      ? capitalizeWords(
          `${appt.coordinatorId.firstName || ""} ${
            appt.coordinatorId.lastName || ""
          }`.trim(),
        ) || appt.coordinatorId.email
      : "—";

    return (
      <div
        key={appt._id}
        role="button"
        tabIndex={0}
        onClick={() => setInspectId(appt._id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setInspectId(appt._id);
          }
        }}
        className="group flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 px-5 py-3.5 bg-white hover:bg-[#F8FAFC] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#001EC5]"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: palette.dot }}
          />
          <span className="text-[13px] font-semibold text-[#001F54] tabular-nums w-[68px] shrink-0">
            {moment(appt.scheduledDate).format("h:mm A")}
          </span>
          <div className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-[#001F54] truncate">
              {isAdmin
                ? `${appt.centerId?.name || "—"} · ${appt.yearId?.name || "—"}`
                : appt.yearId?.name || "Exam Appointment"}
            </span>
            <span className="block text-xs text-[#475569] truncate">
              {isAdmin
                ? `${coordinatorName}${appt.description ? ` — ${appt.description}` : ""}`
                : appt.description || appt.sessionId?.name}
            </span>
          </div>
        </div>

        <div
          className="flex items-center gap-2.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
            {(isAdmin || (isCoordinator && appt.status !== "cancelled")) && (
              <button
                type="button"
                className="bg-transparent border border-[#E5E7EB] hover:border-[#001EC5] rounded-md px-2.5 py-1 text-xs font-medium text-[#334155] hover:text-[#001EC5] transition-colors cursor-pointer"
                onClick={(e) => handleOpenReschedule(appt, e)}
              >
                Reschedule
              </button>
            )}
            {isAdmin && appt.status !== "cancelled" && (
              <button
                type="button"
                className="bg-transparent border border-[#E5E7EB] hover:border-[#001EC5] rounded-md px-2.5 py-1 text-xs font-medium text-[#334155] hover:text-[#001EC5] transition-colors cursor-pointer"
                onClick={(e) => handleOpenCancel(appt, e)}
              >
                Cancel
              </button>
            )}
          </div>
          {isAdmin && appt.status === "pending" ? (
            <Button
              size="sm"
              color="success"
              variant="solid"
              loading={approvingId === appt._id}
              onClick={(e) => handleApprove(appt, e)}
            >
              Approve
            </Button>
          ) : (
            <span className="text-xs font-medium text-[#475569]">
              {statusEntry.label}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderViewSwitcher = () => (
    <div className="inline-flex rounded-lg bg-[#F1F5F9] p-1 self-start sm:self-auto">
      <button
        type="button"
        onClick={() => setViewMode("agenda")}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
          viewMode === "agenda"
            ? "bg-white text-[#001F54] shadow-xs"
            : "text-[#475569] hover:text-[#001F54]"
        }`}
      >
        <ViewAgendaOutlinedIcon sx={{ fontSize: 15 }} />
        Agenda
      </button>
      <button
        type="button"
        onClick={() => setViewMode("week")}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
          viewMode === "week"
            ? "bg-white text-[#001F54] shadow-xs"
            : "text-[#475569] hover:text-[#001F54]"
        }`}
      >
        <ViewWeekOutlinedIcon sx={{ fontSize: 15 }} />
        Week
      </button>
      <button
        type="button"
        onClick={() => setViewMode("month")}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
          viewMode === "month"
            ? "bg-white text-[#001F54] shadow-xs"
            : "text-[#475569] hover:text-[#001F54]"
        }`}
      >
        <CalendarMonthIcon sx={{ fontSize: 15 }} />
        Month
      </button>
    </div>
  );

  const renderScheduleBody = () => (
    <>
      {isLoading || isFetching ? (
        <Stack gap={2}>
          {[1, 2, 3].map((item) => (
            <Box
              key={item}
              sx={{
                bgcolor: "white",
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                p: 2.5,
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <Skeleton
                    variant="rectangular"
                    width={88}
                    height={36}
                    sx={{ borderRadius: "8px" }}
                  />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="40%" height={16} />
                    <Skeleton variant="text" width="75%" height={14} />
                  </div>
                </div>
                <Skeleton
                  variant="rectangular"
                  width={110}
                  height={28}
                  sx={{ borderRadius: "8px" }}
                />
              </div>
            </Box>
          ))}
        </Stack>
      ) : viewMode === "agenda" ? (
        agendaGroups.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-[#CBD5E1] py-14 px-6 text-center">
            <CalendarMonthIcon
              sx={{ fontSize: 40, color: "#94A3B8", mb: 1 }}
            />
            <Typography level="title-md" sx={{ color: "#001F54" }}>
              {focusedDate
                ? `No appointments on ${moment(focusedDate, "YYYY-MM-DD").format("MMM D, YYYY")}`
                : "No exam appointments scheduled"}
            </Typography>
            <Typography
              level="body-sm"
              textColor="neutral.500"
              sx={{ mt: 0.5 }}
            >
              {isCoordinator
                ? "Pick a date and time slot to schedule your next exam."
                : "Adjust your filters or pick another date in the calendar."}
            </Typography>
            {isCoordinator && (
              <Button
                onClick={() => handleOpenCreate(focusedDate || undefined)}
                startDecorator={<AddIcon />}
                sx={{ mt: 2.5, bgcolor: "#001EC5" }}
              >
                Schedule Exam
              </Button>
            )}
          </div>
        ) : (
          <Stack gap={3}>
            {agendaGroups.map(([dateKey, dayAppointments]) => {
              const badge = formatRelativeDayBadge(dateKey);
              return (
                <Box key={dateKey}>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#001F54]">
                        {moment(dateKey, "YYYY-MM-DD").format(
                          "dddd, MMM D, YYYY",
                        )}
                      </span>
                      {badge && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EEF2FF] text-[#001EC5]">
                          {badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-[#64748B] tabular-nums">
                      {dayAppointments.length}{" "}
                      {dayAppointments.length === 1
                        ? "appointment"
                        : "appointments"}
                    </span>
                  </div>

                  <div className="bg-white rounded-xl border border-[#E5E7EB] divide-y divide-[#F1F5F9] overflow-hidden">
                    {dayAppointments.map(renderAgendaRow)}
                  </div>
                </Box>
              );
            })}
          </Stack>
        )
      ) : viewMode === "week" ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-x-auto">
          <div className="grid grid-cols-7 min-w-[780px] divide-x divide-[#E5E7EB]">
            {weekDays.map((day) => {
              const dayEvents = appointmentsByDate.get(day.dateStr) ?? [];
              const isToday = day.dateStr === todayStr;
              const canBook = isCoordinator && day.dateStr >= todayStr;

              return (
                <div
                  key={day.dateStr}
                  className="min-h-[340px] flex flex-col"
                >
                  <div
                    className={`px-2.5 py-3 text-center border-b border-[#E5E7EB] ${
                      isToday ? "bg-[#EEF2FF]/60" : "bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="text-[11px] font-semibold uppercase text-[#64748B]">
                      {day.dayShort}
                    </div>
                    <div
                      className={`mt-1 mx-auto h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold tabular-nums ${
                        isToday
                          ? "bg-[#001EC5] text-white"
                          : "text-[#001F54]"
                      }`}
                    >
                      {day.dayNum}
                    </div>
                  </div>

                  <div className="flex-1 p-2 space-y-2">
                    {dayEvents.map((ev) => {
                      const palette =
                        STATUS_STYLE[ev.status] ?? STATUS_STYLE.rescheduled;
                      return (
                        <button
                          key={ev._id}
                          type="button"
                          onClick={() => setInspectId(ev._id)}
                          style={{
                            backgroundColor: palette.bg,
                            borderColor: palette.border,
                            color: palette.text,
                          }}
                          className="w-full text-left rounded-lg border p-2 transition-shadow hover:shadow-xs cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5 text-[11px] font-bold tabular-nums">
                            <span
                              className="h-1.5 w-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: palette.dot }}
                            />
                            <span>
                              {moment(ev.scheduledDate).format("h:mm A")}
                            </span>
                          </div>
                          <div className="text-xs font-semibold mt-0.5 truncate text-[#001F54]">
                            {isAdmin
                              ? ev.centerId?.name || "—"
                              : ev.yearId?.name || "Exam"}
                          </div>
                          <div className="text-[11px] opacity-80 truncate">
                            {isAdmin
                              ? ev.yearId?.name
                              : ev.description || ev.sessionId?.name}
                          </div>
                        </button>
                      );
                    })}

                    {canBook && (
                      <button
                        type="button"
                        onClick={() => handleOpenCreate(day.dateStr)}
                        className="w-full py-1.5 rounded-lg border border-dashed border-[#CBD5E1] text-[11px] font-medium text-[#64748B] hover:border-[#001EC5] hover:text-[#001EC5] transition-colors cursor-pointer"
                      >
                        + Add slot
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 sm:p-4">
          <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
            {WEEKDAYS_LONG.map((wd) => (
              <div
                key={wd}
                className="text-xs font-semibold text-[#64748B] uppercase py-1"
              >
                {wd}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {monthCells.map((cell, idx) => {
              if (!cell) {
                return (
                  <div
                    key={`cal-empty-${idx}`}
                    className="min-h-[96px] rounded-lg bg-[#F8FAFC]/60"
                  />
                );
              }
              const dayEvents = appointmentsByDate.get(cell.dateStr) ?? [];
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr === focusedDate;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => {
                    setFocusedDate(cell.dateStr);
                    if (dayEvents.length === 1) {
                      setInspectId(dayEvents[0]._id);
                    }
                  }}
                  className={`min-h-[96px] p-1.5 rounded-lg border flex flex-col gap-1 transition-colors cursor-pointer ${
                    isSelected
                      ? "border-[#001EC5] bg-[#EEF2FF]/40"
                      : isToday
                        ? "border-[#001F54]/40 bg-[#F8FAFC]"
                        : "border-[#E5E7EB] bg-white hover:border-[#CBD5E1]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold tabular-nums inline-flex items-center justify-center h-6 w-6 rounded-full ${
                        isToday
                          ? "bg-[#001EC5] text-white"
                          : "text-[#1E293B]"
                      }`}
                    >
                      {cell.dayNum}
                    </span>
                    {isCoordinator && cell.dateStr >= todayStr && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCreate(cell.dateStr);
                        }}
                        aria-label={`Schedule on ${cell.dateStr}`}
                        className="h-5 w-5 rounded hover:bg-[#EEF2FF] text-[#64748B] hover:text-[#001EC5] flex items-center justify-center cursor-pointer"
                      >
                        <AddIcon sx={{ fontSize: 14 }} />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 w-full overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const palette =
                        STATUS_STYLE[ev.status] ?? STATUS_STYLE.rescheduled;
                      return (
                        <button
                          key={ev._id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectId(ev._id);
                          }}
                          style={{
                            backgroundColor: palette.bg,
                            borderColor: palette.border,
                            color: palette.text,
                          }}
                          className="w-full text-left truncate rounded border px-1.5 py-0.5 text-[10px] font-semibold tabular-nums cursor-pointer hover:opacity-90"
                        >
                          {moment(ev.scheduledDate).format("h:mm A")}{" "}
                          {isAdmin
                            ? `· ${ev.centerId?.name || ""}`
                            : `· ${ev.yearId?.name || ""}`}
                        </button>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFocusedDate(cell.dateStr);
                          setViewMode("agenda");
                        }}
                        className="text-left text-[10px] font-semibold text-[#001EC5] px-1 hover:underline cursor-pointer tabular-nums"
                      >
                        +{dayEvents.length - 2} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {totalPages > 1 && viewMode === "agenda" && !focusedDate && (
        <AppPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </>
  );

  return (
    <DefaultHeader title="Exam Appointments">
      <div className="max-w-[1120px] mx-auto flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 bg-white border border-[#E5E7EB] rounded-[10px] p-1">
            {statusFilters.map((st) => {
              const active = statusFilter === st.value;
              return (
                <button
                  key={st.label}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st.value);
                    setPage(1);
                  }}
                  className={`inline-flex items-center gap-1.5 px-[11px] py-1.5 rounded-[7px] text-xs transition-colors cursor-pointer ${
                    active
                      ? "bg-[#EEF2FF] text-[#001EC5] font-semibold"
                      : "bg-transparent text-[#475569] font-medium hover:text-[#001F54] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: st.dot }}
                  />
                  <span>{st.label}</span>
                  <span
                    className={`text-[11px] tabular-nums px-1.5 py-0.5 rounded-full ${
                      active
                        ? "bg-white text-[#001EC5]"
                        : "bg-[#F1F5F9] text-[#475569]"
                    }`}
                  >
                    {st.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {renderViewSwitcher()}
            {isCoordinator && (
              <Button
                size="sm"
                startDecorator={<AddIcon />}
                onClick={() => handleOpenCreate()}
                sx={{ bgcolor: "#001EC5", "&:hover": { bgcolor: "#00189E" } }}
              >
                Schedule Exam
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-[10px]">
          <div className="flex items-center gap-2">
            {viewMode !== "agenda" && (
              <div className="flex items-center gap-1 mr-1">
                <IconButton
                  size="sm"
                  variant="plain"
                  color="neutral"
                  onClick={() => handleStepPeriod(-1)}
                  aria-label="Previous period"
                >
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                <Button
                  size="sm"
                  variant="outlined"
                  color="neutral"
                  onClick={handleToday}
                >
                  Today
                </Button>
                <IconButton
                  size="sm"
                  variant="plain"
                  color="neutral"
                  onClick={() => handleStepPeriod(1)}
                  aria-label="Next period"
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </div>
            )}
            <h2 className="text-sm sm:text-base font-semibold text-[#001F54] tabular-nums">
              {getToolbarTitle()}
            </h2>
            {focusedDate && viewMode === "agenda" && (
              <button
                type="button"
                onClick={() => setFocusedDate("")}
                className="px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#001EC5] text-xs font-semibold cursor-pointer"
              >
                Show all
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              size="sm"
              value={selectedSessionId}
              onChange={(_, val) => {
                if (val) {
                  setSelectedSessionId(val);
                  setSelectedYearId("");
                  setPage(1);
                }
              }}
              placeholder="Session"
              sx={{ minWidth: 190 }}
            >
              {sessions.map((s) => (
                <Option key={s._id} value={s._id}>
                  {s.name} {s.isCurrent ? "(Current)" : ""}
                </Option>
              ))}
            </Select>

            <Select
              size="sm"
              value={selectedYearId}
              onChange={(_, val) => {
                setSelectedYearId(val ?? "");
                setPage(1);
              }}
              placeholder="All Years"
              sx={{ minWidth: 120 }}
            >
              <Option value="">All Years</Option>
              {filterYears.map((y) => (
                <Option key={y._id} value={y._id}>
                  {y.name}
                </Option>
              ))}
            </Select>

            {isAdmin && (
              <div className="w-[180px]">
                <SearchableSelect
                  size="sm"
                  options={centerOptions}
                  value={selectedCenterId}
                  onChange={(val) => {
                    setSelectedCenterId(val);
                    setPage(1);
                  }}
                  placeholder="All Centres"
                />
              </div>
            )}
          </div>
        </div>

        {renderScheduleBody()}
      </div>

      {/* Appointy Slide-Over Appointment Detail Drawer */}
      <Drawer
        anchor="right"
        size="md"
        open={Boolean(inspectedAppointment)}
        onClose={() => setInspectId(null)}
      >
        {inspectedAppointment && (() => {
          const appt = inspectedAppointment;
          const statusEntry = resolveStatus(APPOINTMENT_STATUS, appt.status);
          const palette =
            STATUS_STYLE[appt.status] ?? STATUS_STYLE.rescheduled;
          const coordinatorName = appt.coordinatorId
            ? capitalizeWords(
                `${appt.coordinatorId.firstName || ""} ${
                  appt.coordinatorId.lastName || ""
                }`.trim(),
              ) || appt.coordinatorId.email
            : "—";

          return (
            <div className="flex flex-col h-full bg-white">
              <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-[#F1F5F9]">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#334155]">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: palette.dot }}
                    />
                    {statusEntry.label}
                  </span>
                  <h4 className="mt-1.5 text-xl font-bold text-[#001F54] leading-snug">
                    {appt.centerId?.name ||
                      appt.yearId?.name ||
                      "Exam Appointment"}
                  </h4>
                </div>
                <ModalClose sx={{ position: "static" }} />
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                <div className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC]">
                  <span className="flex items-center gap-2 text-[13px] font-medium text-[#334155]">
                    <AccessTimeIcon sx={{ fontSize: 16, color: "#64748B" }} />
                    <span>
                      {moment(appt.scheduledDate).format("ddd, MMM D, YYYY")}
                    </span>
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-[#001F54] tabular-nums whitespace-nowrap">
                      {moment(appt.scheduledDate).format("h:mm A")}
                    </div>
                    {appt.previousDate && (
                      <span className="block text-[11px] text-[#64748B] line-through text-right tabular-nums">
                        {moment(appt.previousDate).format("MMM D · h:mm A")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col border-t border-[#F1F5F9]">
                  <div className="flex justify-between gap-4 py-2.5 border-b border-[#F1F5F9] text-[13px]">
                    <span className="text-[#64748B] font-medium shrink-0">
                      Program
                    </span>
                    <span className="text-[#1E293B] font-medium text-right break-words">
                      {appt.yearId?.name || "—"}
                      {appt.sessionId?.name ? ` · ${appt.sessionId.name}` : ""}
                    </span>
                  </div>
                  {appt.centerId?.location && (
                    <div className="flex justify-between gap-4 py-2.5 border-b border-[#F1F5F9] text-[13px]">
                      <span className="text-[#64748B] font-medium shrink-0">
                        Location
                      </span>
                      <span className="text-[#1E293B] font-medium text-right break-words">
                        {appt.centerId.location}
                      </span>
                    </div>
                  )}
                  {isAdmin && (
                    <>
                      <div className="flex justify-between gap-4 py-2.5 border-b border-[#F1F5F9] text-[13px]">
                        <span className="text-[#64748B] font-medium shrink-0">
                          Coordinator
                        </span>
                        <span className="text-[#1E293B] font-medium text-right break-words">
                          {coordinatorName}
                        </span>
                      </div>
                      {appt.coordinatorId?.email && (
                        <div className="flex justify-between gap-4 py-2.5 border-b border-[#F1F5F9] text-[13px]">
                          <span className="text-[#64748B] font-medium shrink-0">
                            Email
                          </span>
                          <span className="text-[#1E293B] font-medium text-right break-words">
                            {appt.coordinatorId.email}
                          </span>
                        </div>
                      )}
                      {appt.coordinatorId?.phone && (
                        <div className="flex justify-between gap-4 py-2.5 border-b border-[#F1F5F9] text-[13px]">
                          <span className="text-[#64748B] font-medium shrink-0">
                            Phone
                          </span>
                          <span className="text-[#1E293B] font-medium text-right tabular-nums">
                            {appt.coordinatorId.phone}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                    Description &amp; Notes
                  </div>
                  <p className="text-[13.5px] text-[#334155] leading-relaxed whitespace-pre-wrap break-words">
                    {appt.description || "—"}
                  </p>
                </div>

                {appt.status === "cancelled" && appt.cancellationReason && (
                  <div className="px-3 py-2.5 rounded-lg text-xs font-medium border border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]">
                    Cancellation Reason: {appt.cancellationReason}
                  </div>
                )}

                {appt.rescheduleReason && appt.status !== "cancelled" && (
                  <div className="px-3 py-2.5 rounded-lg text-xs font-medium border border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A8A]">
                    {appt.rescheduledBy === "coordinator"
                      ? "Coordinator Note: "
                      : "Admin Note: "}
                    {appt.rescheduleReason}
                  </div>
                )}

                {appt.history && appt.history.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                      Activity Log
                    </div>
                    <div className="flex flex-col gap-3 pl-3.5 ml-1 border-l border-[#E5E7EB]">
                      {appt.history.map((item, idx) => (
                        <div
                          key={`${item.timestamp}-${idx}`}
                          className="flex justify-between gap-3 text-xs"
                        >
                          <div>
                            <span className="font-semibold capitalize text-[#001F54]">
                              {item.action}
                            </span>{" "}
                            <span className="text-[#64748B]">
                              by {item.actorRole}
                            </span>
                            {item.reason && (
                              <p className="text-[#475569] mt-0.5">
                                “{item.reason}”
                              </p>
                            )}
                          </div>
                          <span className="text-[#64748B] shrink-0 tabular-nums">
                            {moment(item.timestamp).format("MMM D, h:mm A")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-3.5 border-t border-[#E5E7EB] bg-[#F8FAFC] flex flex-wrap items-center gap-2">
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
                    variant="plain"
                    onClick={() => handleOpenCancel(appt)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          );
        })()}
      </Drawer>

      {/* Schedule Exam Modal (Coordinator) */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        sx={{ zIndex: 1400 }}
      >
        <ModalDialog
          sx={{
            width: "100%",
            maxWidth: 640,
            maxHeight: "92vh",
            overflow: "auto",
            borderRadius: "10px",
            p: 3,
            boxShadow: "0 12px 32px rgba(15, 23, 42, 0.10)",
            border: "1px solid #E5E7EB",
          }}
        >
          <ModalClose />
          <DialogTitle sx={{ color: "#001F54", fontWeight: 600, fontSize: "1rem" }}>
            Schedule Exam Appointment
          </DialogTitle>
          <Divider sx={{ borderColor: "#F1F5F9" }} />
          <DialogContent>
            <form onSubmit={handleCreateSubmit}>
              <Stack gap={2.5} sx={{ mt: 1.5 }}>
                <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
                  <FormControl required sx={{ flex: 1 }}>
                    <FormLabel sx={{ color: "#475569", fontWeight: 500 }}>
                      Academic Session
                    </FormLabel>
                    <Select
                      value={formSessionId}
                      slotProps={{ listbox: { sx: { zIndex: 1500 } } }}
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

                  <FormControl required sx={{ flex: 1 }}>
                    <FormLabel sx={{ color: "#475569", fontWeight: 500 }}>
                      Academic Year
                    </FormLabel>
                    <Select
                      value={formYearId}
                      disabled={loadingFormYears || formYears.length === 0}
                      slotProps={{ listbox: { sx: { zIndex: 1500 } } }}
                      placeholder={
                        loadingFormYears
                          ? "Loading academic years..."
                          : "Select Academic Year"
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
                </Stack>

                <FormControl required>
                  <FormLabel sx={{ color: "#475569", fontWeight: 500 }}>
                    Date &amp; Time Slot
                  </FormLabel>
                  <AppointyDateTimePicker
                    date={formDate}
                    time={formTime}
                    onDateChange={setFormDate}
                    onTimeChange={setFormTime}
                  />
                </FormControl>

                <FormControl required>
                  <FormLabel sx={{ color: "#475569", fontWeight: 500 }}>
                    Description &amp; Venue Notes
                  </FormLabel>
                  <Textarea
                    minRows={3}
                    placeholder="e.g. Final Exam for Year 1 students, proctoring or venue details..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </FormControl>

                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  gap={1.5}
                  sx={{ mt: 0.5, pt: 1.5, borderTop: "1px solid #F1F5F9" }}
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
                    sx={{ bgcolor: "#001EC5", "&:hover": { bgcolor: "#00189E" } }}
                  >
                    Confirm Appointment
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
        sx={{ zIndex: 1400 }}
      >
        <ModalDialog
          sx={{
            width: "100%",
            maxWidth: 640,
            maxHeight: "92vh",
            p: 0,
            overflow: "hidden",
            borderRadius: "10px",
            bgcolor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            boxShadow: "0 12px 32px rgba(15, 23, 42, 0.12)",
          }}
        >
          <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-3.5">
            <div>
              <h2 className="m-0 text-base font-semibold text-[#001F54]">
                Reschedule Exam Appointment
              </h2>
              {rescheduleTarget && (
                <p className="mt-0.5 text-xs text-[#64748B]">
                  {rescheduleTarget.centerId?.name} · {rescheduleTarget.yearId?.name}
                </p>
              )}
            </div>
            <ModalClose sx={{ position: "static" }} />
          </div>

          {rescheduleTarget && (
            <form
              onSubmit={handleRescheduleSubmit}
              className="flex flex-col min-h-0 flex-1"
            >
              <div className="px-6 pb-4.5 flex flex-col gap-3 overflow-y-auto">
                <AppointyDateTimePicker
                  date={rescheduleDate}
                  time={rescheduleTime}
                  onDateChange={setRescheduleDate}
                  onTimeChange={setRescheduleTime}
                />

                <Input
                  size="sm"
                  placeholder={
                    isAdmin
                      ? "Optional note for coordinator..."
                      : "Optional reason for rescheduling..."
                  }
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2.5 px-6 py-3.5 border-t border-[#E5E7EB] bg-[#F8FAFC]">
                <span className="text-xs text-[#475569] tabular-nums">
                  {moment(rescheduleTarget.scheduledDate).format("MMM D, h:mm A")}{" "}
                  →{" "}
                  <strong className="text-[#001F54]">
                    {rescheduleDate
                      ? `${moment(rescheduleDate, "YYYY-MM-DD").format("MMM D")}, ${moment(rescheduleTime, "HH:mm").format("h:mm A")}`
                      : "Pick a slot"}
                  </strong>
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant="outlined"
                    color="neutral"
                    onClick={() => setRescheduleTarget(null)}
                  >
                    Close
                  </Button>
                  <Button
                    type="submit"
                    loading={isRescheduling}
                    sx={{ bgcolor: "#001EC5", "&:hover": { bgcolor: "#00189E" } }}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </form>
          )}
        </ModalDialog>
      </Modal>

      {/* Cancel Modal (Admin) */}
      <Modal
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        sx={{ zIndex: 1400 }}
      >
        <ModalDialog
          sx={{
            width: "100%",
            maxWidth: 460,
            p: 0,
            overflow: "hidden",
            borderRadius: "10px",
            bgcolor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            boxShadow: "0 12px 32px rgba(15, 23, 42, 0.12)",
          }}
        >
          <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-3.5">
            <div>
              <h2 className="m-0 text-base font-semibold text-[#001F54]">
                Cancel Exam Appointment
              </h2>
              <p className="mt-0.5 text-xs text-[#64748B]">
                The coordinator will be notified immediately.
              </p>
            </div>
            <ModalClose sx={{ position: "static" }} />
          </div>

          {cancelTarget && (
            <form onSubmit={handleCancelSubmit}>
              <div className="px-6 pb-4.5 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC]">
                  <span className="text-[13px] font-semibold text-[#001F54]">
                    {cancelTarget.centerId?.name} · {cancelTarget.yearId?.name}
                  </span>
                  <span className="text-xs text-[#475569] tabular-nums text-right">
                    {moment(cancelTarget.scheduledDate).format("MMM D, YYYY · h:mm A")}
                  </span>
                </div>

                <FormControl required>
                  <FormLabel sx={{ color: "#475569", fontWeight: 500, mb: 0.75 }}>
                    Reason for Cancellation
                  </FormLabel>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {[
                      "Schedule conflict",
                      "Venue unavailable",
                      "Coordinator request",
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className="px-2.5 py-0.5 rounded-full border border-[#E5E7EB] bg-white text-[11.5px] font-medium text-[#475569] hover:border-[#001EC5] hover:text-[#001EC5] hover:bg-[#EEF2FF] transition-colors cursor-pointer"
                        onClick={() => setCancelReason(preset)}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    minRows={3}
                    placeholder="Provide a clear reason for cancelling this appointment..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                </FormControl>
              </div>

              <div className="flex justify-end gap-2.5 px-6 py-3.5 border-t border-[#E5E7EB] bg-[#F8FAFC]">
                <Button
                  variant="outlined"
                  color="neutral"
                  onClick={() => setCancelTarget(null)}
                >
                  Keep Appointment
                </Button>
                <Button
                  type="submit"
                  color="danger"
                  variant="solid"
                  loading={isCancelling}
                >
                  Cancel Appointment
                </Button>
              </div>
            </form>
          )}
        </ModalDialog>
      </Modal>
    </DefaultHeader>
  );
};

export default ExamAppointmentsPage;
