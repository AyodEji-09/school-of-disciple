import {
  Input,
  Typography,
  FormControl,
  FormLabel,
  Select,
  Option,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import AppModal from "../../components/modal/modal";
import {
  useGetSessionsQuery,
  useGetYearsQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
  useActivateSessionMutation,
} from "../../data/rtk/academic";
import { CenteredEmptyState } from "../../components/query-state/QueryStates";
import { handleError } from "../../utils";
import { Delete, Add, Edit } from "@mui/icons-material";
import PageCard from "../../components/feedback/PageCard";

const MONTHS = [
  { value: 1, short: "Jan", label: "January" },
  { value: 2, short: "Feb", label: "February" },
  { value: 3, short: "Mar", label: "March" },
  { value: 4, short: "Apr", label: "April" },
  { value: 5, short: "May", label: "May" },
  { value: 6, short: "Jun", label: "June" },
  { value: 7, short: "Jul", label: "July" },
  { value: 8, short: "Aug", label: "August" },
  { value: 9, short: "Sep", label: "September" },
  { value: 10, short: "Oct", label: "October" },
  { value: 11, short: "Nov", label: "November" },
  { value: 12, short: "Dec", label: "December" },
];

const formatSessionSpan = (s: AcademicSession) => {
  if (s.startMonth && s.endMonth) {
    const sm = MONTHS.find((m) => m.value === s.startMonth)?.short ?? "";
    const em = MONTHS.find((m) => m.value === s.endMonth)?.short ?? "";
    return `${sm} ${s.startYear} – ${em} ${s.endYear}`;
  }
  return s.startYear === s.endYear
    ? String(s.startYear)
    : `${s.startYear} – ${s.endYear}`;
};

const addMonths = (year: number, month: number, offset: number) => {
  const total = year * 12 + (month - 1) + offset;
  return {
    year: Math.floor(total / 12),
    month: (total % 12) + 1,
  };
};

const SessionsSection = () => {
  const { data: sessionsData = [], isLoading } = useGetSessionsQuery();
  const sessions = sessionsData as unknown as AcademicSession[];
  const [createSession, { isLoading: creating }] = useCreateSessionMutation();
  const [updateSession, { isLoading: updating }] = useUpdateSessionMutation();
  const [deleteSession] = useDeleteSessionMutation();
  const [activateSession, { isLoading: activating }] = useActivateSessionMutation();
  const navigate = useNavigate();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<AcademicSession | null>(null);
  const [name, setName] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [startMonth, setStartMonth] = useState<string>("");
  const [endMonth, setEndMonth] = useState<string>("");

  const resetForm = () => {
    setName("");
    setStartYear("");
    setEndYear("");
    setStartMonth("");
    setEndMonth("");
  };

  const applyDefaultTenMonthEnd = (syStr: string, smStr: string) => {
    const sy = Number(syStr);
    const sm = Number(smStr);
    if (sy >= 1900 && sm >= 1 && sm <= 12) {
      // 10-month inclusive span (e.g. Jan 2027 -> Oct 2027)
      const end = addMonths(sy, sm, 9);
      setEndYear(String(end.year));
      setEndMonth(String(end.month));
    }
  };

  const validateSessionDates = (requireMonths: boolean) => {
    if (!name.trim() || !startYear || !endYear) {
      toast.error("Fill all required fields");
      return false;
    }
    const sy = Number(startYear);
    const ey = Number(endYear);
    const hasStartMonth = startMonth !== "";
    const hasEndMonth = endMonth !== "";

    if (requireMonths && (!hasStartMonth || !hasEndMonth)) {
      toast.error("Select both start and end months");
      return false;
    }
    if (hasStartMonth !== hasEndMonth) {
      toast.error("Select both start and end months, or leave both blank");
      return false;
    }
    if (ey < sy) {
      toast.error("End year cannot be before start year");
      return false;
    }
    if (ey - sy > 10) {
      toast.error("Session span cannot exceed 10 years");
      return false;
    }
    if (hasStartMonth && hasEndMonth) {
      const sm = Number(startMonth);
      const em = Number(endMonth);
      if (ey * 12 + em <= sy * 12 + sm) {
        toast.error("End month and year must be after start month and year");
        return false;
      }
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validateSessionDates(true)) return;
    const duplicate = sessions.find((s) => s.startYear === Number(startYear));
    if (duplicate) {
      const confirmed = window.confirm(
        `"${duplicate.name}" already has start year ${startYear}.\n\nCreating another session with the same start year may cause ambiguity when linking students by admission year.\n\nProceed anyway?`,
      );
      if (!confirmed) return;
    }
    try {
      await createSession({
        name: name.trim(),
        startYear: Number(startYear),
        endYear: Number(endYear),
        ...(startMonth !== "" && { startMonth: Number(startMonth) }),
        ...(endMonth !== "" && { endMonth: Number(endMonth) }),
      }).unwrap();
      setCreateModalOpen(false);
      resetForm();
      toast.success(
        <div>
          <div>Session created</div>
          <AppButton
            variant="outlined"
            size="sm"
            onClick={() => navigate("/dashboard/configurations/registration")}
            className="!h-8 !px-3 !text-xs !whitespace-nowrap mt-2"
          >
            Create Registration Window
          </AppButton>
        </div>,
        { autoClose: 8000 },
      );
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  const openEdit = (session: AcademicSession) => {
    setEditingSession(session);
    setName(session.name);
    setStartYear(String(session.startYear));
    setEndYear(String(session.endYear));
    setStartMonth(session.startMonth ? String(session.startMonth) : "");
    setEndMonth(session.endMonth ? String(session.endMonth) : "");
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingSession || !validateSessionDates(false)) return;
    const duplicate = sessions.find(
      (s) => s._id !== editingSession._id && s.startYear === Number(startYear),
    );
    if (duplicate) {
      const confirmed = window.confirm(
        `"${duplicate.name}" already has start year ${startYear}.\n\nUpdating this session to share the same start year may cause ambiguity when linking students by admission year.\n\nProceed anyway?`,
      );
      if (!confirmed) return;
    }
    try {
      await updateSession({
        id: editingSession._id,
        name: name.trim(),
        startYear: Number(startYear),
        endYear: Number(endYear),
        ...(startMonth !== "" && { startMonth: Number(startMonth) }),
        ...(endMonth !== "" && { endMonth: Number(endMonth) }),
      }).unwrap();
      setEditModalOpen(false);
      resetForm();
      setEditingSession(null);
      toast.success("Session updated");
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  const handleDelete = async (id: string, sessionName: string) => {
    if (
      !window.confirm(`Delete session "${sessionName}"? This cannot be undone.`)
    )
      return;
    try {
      await deleteSession(id).unwrap();
      toast.success("Session deleted");
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  const handleActivate = async (id: string, sessionName: string) => {
    if (
      !window.confirm(
        `Activate "${sessionName}"?\n\nThis will mark it as the current session and close any open registration windows for other sessions.`,
      )
    )
      return;
    try {
      await activateSession(id).unwrap();
      toast.success(`"${sessionName}" is now the current session`);
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  return (
    <PageCard
      title="Academic Sessions"
      subtitle="e.g. Jan – Oct 2027 Academic Session (10-month cycle)"
      action={
        <AppButton onClick={() => setCreateModalOpen(true)} size="sm">
          <Add sx={{ fontSize: 16, mr: 0.5 }} /> Add Session
        </AppButton>
      }
    >
      <AppModal
        isOpen={createModalOpen}
        close={() => { resetForm(); setCreateModalOpen(false); }}
        title="Add New Session"
        icon
      >
        <div className="w-[min(460px,84vw)] mt-2 grid gap-4">
          <FormControl required>
            <FormLabel>Name</FormLabel>
            <Input
              placeholder="e.g. Jan – Oct 2027 Academic Session"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <div className="grid grid-cols-2 gap-3">
            <FormControl required>
              <FormLabel>Start Month</FormLabel>
              <Select
                placeholder="Month"
                value={startMonth || null}
                slotProps={{ listbox: { sx: { zIndex: 1500 } } }}
                onChange={(_, val) => {
                  const next = val ? String(val) : "";
                  setStartMonth(next);
                  applyDefaultTenMonthEnd(startYear, next);
                }}
              >
                {MONTHS.map((m) => (
                  <Option key={m.value} value={String(m.value)}>
                    {m.label}
                  </Option>
                ))}
              </Select>
            </FormControl>
            <FormControl required>
              <FormLabel>Start Year</FormLabel>
              <Input
                type="number"
                placeholder="2027"
                slotProps={{ input: { min: 1900, max: new Date().getFullYear() + 5 } }}
                value={startYear}
                onChange={(e) => {
                  setStartYear(e.target.value);
                  applyDefaultTenMonthEnd(e.target.value, startMonth);
                }}
              />
            </FormControl>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormControl required>
              <FormLabel>End Month</FormLabel>
              <Select
                placeholder="Month"
                value={endMonth || null}
                slotProps={{ listbox: { sx: { zIndex: 1500 } } }}
                onChange={(_, val) => setEndMonth(val ? String(val) : "")}
              >
                {MONTHS.map((m) => (
                  <Option key={m.value} value={String(m.value)}>
                    {m.label}
                  </Option>
                ))}
              </Select>
            </FormControl>
            <FormControl required>
              <FormLabel>End Year</FormLabel>
              <Input
                type="number"
                placeholder="2027"
                slotProps={{ input: { min: 1900, max: new Date().getFullYear() + 5 } }}
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
              />
            </FormControl>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <AppButton
              variant="outlined"
              onClick={() => { resetForm(); setCreateModalOpen(false); }}
              disabled={creating}
            >
              Cancel
            </AppButton>
            <AppButton onClick={handleCreate} loading={creating}>
              Create Session
            </AppButton>
          </div>
        </div>
      </AppModal>

      <AppModal
        isOpen={editModalOpen}
        close={() => { resetForm(); setEditingSession(null); setEditModalOpen(false); }}
        title={`Edit ${editingSession?.name ?? "Session"}`}
        icon
      >
        <div className="w-[min(460px,84vw)] mt-2 grid gap-4">
          <FormControl required>
            <FormLabel>Name</FormLabel>
            <Input
              placeholder="e.g. Jan – Oct 2027 Academic Session"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <div className="grid grid-cols-2 gap-3">
            <FormControl>
              <FormLabel>Start Month</FormLabel>
              <Select
                placeholder="Month (optional)"
                value={startMonth || null}
                slotProps={{ listbox: { sx: { zIndex: 1500 } } }}
                onChange={(_, val) => setStartMonth(val ? String(val) : "")}
              >
                {MONTHS.map((m) => (
                  <Option key={m.value} value={String(m.value)}>
                    {m.label}
                  </Option>
                ))}
              </Select>
            </FormControl>
            <FormControl required>
              <FormLabel>Start Year</FormLabel>
              <Input
                type="number"
                placeholder="2027"
                slotProps={{ input: { min: 1900, max: new Date().getFullYear() + 5 } }}
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
              />
            </FormControl>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormControl>
              <FormLabel>End Month</FormLabel>
              <Select
                placeholder="Month (optional)"
                value={endMonth || null}
                slotProps={{ listbox: { sx: { zIndex: 1500 } } }}
                onChange={(_, val) => setEndMonth(val ? String(val) : "")}
              >
                {MONTHS.map((m) => (
                  <Option key={m.value} value={String(m.value)}>
                    {m.label}
                  </Option>
                ))}
              </Select>
            </FormControl>
            <FormControl required>
              <FormLabel>End Year</FormLabel>
              <Input
                type="number"
                placeholder="2027"
                slotProps={{ input: { min: 1900, max: new Date().getFullYear() + 5 } }}
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
              />
            </FormControl>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <AppButton
              variant="outlined"
              onClick={() => { resetForm(); setEditingSession(null); setEditModalOpen(false); }}
              disabled={updating}
            >
              Cancel
            </AppButton>
            <AppButton onClick={handleUpdate} loading={updating}>
              Update Session
            </AppButton>
          </div>
        </div>
      </AppModal>

      {isLoading ? (
        <div className="text-center py-6 text-[#94A3B8] text-sm">Loading…</div>
      ) : sessions.length === 0 ? (
        <CenteredEmptyState description="No sessions yet. Click Add Session to create one." />
      ) : (
        <div className="grid gap-2">
          {sessions.map((s) => (
            <div
              key={s._id}
              className="flex items-center justify-between border border-[#E6ECFF] rounded-xl px-4 py-3 gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-semibold text-[#001F54] text-sm truncate">
                  {s.name}
                </span>
                <span className="text-xs text-[#64748B] tabular-nums shrink-0">
                  {formatSessionSpan(s)}
                </span>
                {s.isCurrent && (
                  <span className="text-[11px] font-bold text-[#15803D] bg-[#D1FAE5] border border-[#6EE7B7] px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                    Current
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!s.isCurrent && (
                  <button
                    onClick={() => handleActivate(s._id, s.name)}
                    disabled={activating}
                    className="text-[#15803D] hover:text-[#16A34A] transition-colors p-1 text-xs font-semibold"
                    aria-label={`Activate ${s.name}`}
                  >
                    Activate
                  </button>
                )}
                <button
                  onClick={() => openEdit(s)}
                  className="text-[#64748B] hover:text-[#001EC5] transition-colors p-1"
                  aria-label={`Edit ${s.name}`}
                >
                  <Edit sx={{ fontSize: 18 }} />
                </button>
                <button
                  onClick={() => handleDelete(s._id, s.name)}
                  className="text-red-400 hover:text-red-600 transition-colors p-1"
                  aria-label={`Delete ${s.name}`}
                >
                  <Delete sx={{ fontSize: 18 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageCard>
  );
};

const YearsSection = () => {
  const { data: sessionsData = [] } = useGetSessionsQuery();
  const sessions = sessionsData as unknown as AcademicSession[];
  const [selectedSession, setSelectedSession] = useState("");

  useEffect(() => {
    if (sessions.length > 0 && !selectedSession) {
      const current = sessions.find((s) => s.isCurrent) ?? sessions[0];
      if (current) setSelectedSession(current._id);
    }
  }, [sessions, selectedSession]);

  const { data: yearsData = [], isLoading } = useGetYearsQuery(
    selectedSession ? { sessionId: selectedSession } : undefined,
    { skip: !selectedSession },
  );
  const years = yearsData as unknown as AcademicYear[];

  const sortedYears = [...years].sort((a, b) => a.number - b.number);

  return (
    <PageCard
      title="Academic Years"
      subtitle="Years are auto-generated when a session is created"
    >
      <FormControl size="sm" sx={{ mb: 4, maxWidth: 320 }}>
        <FormLabel>Select Session</FormLabel>
        <Select
          placeholder="Pick a session to view its years"
          value={selectedSession}
          onChange={(_, v) => setSelectedSession(v as string)}
        >
          {sessions.map((s) => (
            <Option key={s._id} value={s._id}>
              {s.name}
            </Option>
          ))}
        </Select>
      </FormControl>

      {selectedSession &&
        (isLoading ? (
          <div className="text-center py-6 text-[#94A3B8] text-sm">
            Loading years…
          </div>
        ) : sortedYears.length === 0 ? (
          <CenteredEmptyState description="No years returned for this session. Confirm the session was created after the year-generation feature was enabled." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {sortedYears.map((y) => {
              const isTheory = /^theory/i.test(y.name);
              const numMatch = y.name.match(/(\d+)/);
              return (
                <div
                  key={y._id}
                  className="border border-[#E6ECFF] rounded-xl p-3 text-center bg-[#F8FAFC]"
                >
                  <Typography level="body-xs" textColor="neutral.500">
                    {isTheory ? "Theory" : "Year"}
                  </Typography>
                  <Typography
                    level="title-lg"
                    sx={{ color: "#001F54", fontWeight: 800 }}
                  >
                    {numMatch ? numMatch[1] : y.number}
                  </Typography>
                </div>
              );
            })}
          </div>
        ))}

      {!selectedSession && (
        <div className="text-center py-8 text-[#94A3B8] text-sm">
          ← Select a session above to view its 10 academic years
        </div>
      )}
    </PageCard>
  );
};

const AcademicSetupPage = () => (
  <Frame text="Academic Setup">
    <Typography level="body-sm" textColor="neutral.500" sx={{ mt: 2, mb: 3 }}>
      Create academic sessions. The backend auto-generates 10 academic years
      (Year 1–Year 10) for every new session, and results are recorded against
      those years.
    </Typography>
    <div className="grid gap-6 pb-16">
      <SessionsSection />
      <YearsSection />
    </div>
  </Frame>
);

export default AcademicSetupPage;
