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
} from "../../data/rtk/academic";
import { CenteredEmptyState } from "../../components/query-state/QueryStates";
import { handleError } from "../../utils";
import { Delete, Add, Edit } from "@mui/icons-material";
import PageCard from "../../components/feedback/PageCard";

const SessionsSection = () => {
  const { data: sessionsData = [], isLoading } = useGetSessionsQuery();
  const sessions = sessionsData as unknown as AcademicSession[];
  const [createSession, { isLoading: creating }] = useCreateSessionMutation();
  const [updateSession, { isLoading: updating }] = useUpdateSessionMutation();
  const [deleteSession] = useDeleteSessionMutation();
  const navigate = useNavigate();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<AcademicSession | null>(null);
  const [name, setName] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");

  const resetForm = () => {
    setName("");
    setStartYear("");
    setEndYear("");
  };

  const handleCreate = async () => {
    if (!name || !startYear || !endYear) return toast.error("Fill all fields");
    try {
      await createSession({
        name,
        startYear: Number(startYear),
        endYear: Number(endYear),
        isCurrent: true,
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
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingSession || !name || !startYear || !endYear)
      return toast.error("Fill all fields");
    try {
      await updateSession({
        id: editingSession._id,
        name,
        startYear: Number(startYear),
        endYear: Number(endYear),
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

  return (
    <PageCard
      title="Academic Sessions"
      subtitle="e.g. 2024/2025, 2025/2026"
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
        <div className="w-[min(440px,80vw)] mt-2 grid gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            This session will be set as the current academic session. Any
            previously current session will be unmarked.
          </div>
          <FormControl required>
            <FormLabel>Name</FormLabel>
            <Input
              placeholder="e.g. 2025/2026 Academic Session"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <div className="grid grid-cols-2 gap-3">
            <FormControl required>
              <FormLabel>Start Year</FormLabel>
              <Input
                type="number"
                placeholder="2025"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
              />
            </FormControl>
            <FormControl required>
              <FormLabel>End Year</FormLabel>
              <Input
                type="number"
                placeholder="2026"
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
        <div className="w-[min(440px,80vw)] mt-2 grid gap-4">
          <FormControl required>
            <FormLabel>Name</FormLabel>
            <Input
              placeholder="e.g. 2025/2026 Academic Session"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <div className="grid grid-cols-2 gap-3">
            <FormControl required>
              <FormLabel>Start Year</FormLabel>
              <Input
                type="number"
                placeholder="2025"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
              />
            </FormControl>
            <FormControl required>
              <FormLabel>End Year</FormLabel>
              <Input
                type="number"
                placeholder="2026"
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
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-[#001F54] text-sm truncate">
                  {s.name}
                </span>
                {s.isCurrent && (
                  <span className="text-[11px] font-bold text-[#15803D] bg-[#D1FAE5] border border-[#6EE7B7] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Current
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
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
      subtitle="10 years (Year 1–Year 10) are auto-generated for each session"
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
            {sortedYears.map((y) => (
              <div
                key={y._id}
                className="border border-[#E6ECFF] rounded-xl p-3 text-center bg-[#F8FAFC]"
              >
                <Typography level="body-xs" textColor="neutral.500">
                  Year
                </Typography>
                <Typography
                  level="title-lg"
                  sx={{ color: "#001F54", fontWeight: 800 }}
                >
                  {y.number}
                </Typography>
                <Typography level="body-xs" textColor="neutral.500">
                  {y.name}
                </Typography>
              </div>
            ))}
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
