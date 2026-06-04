import { Input, Typography, Stack, FormControl, FormLabel, Select, Option } from "@mui/joy";
import { useState } from "react";
import { toast } from "react-toastify";
import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import {
  useGetSessionsQuery, useGetTermsQuery, useGetSubjectsQuery,
  useCreateSessionMutation, useDeleteSessionMutation,
  useCreateTermMutation, useDeleteTermMutation,
  useCreateSubjectMutation, useDeleteSubjectMutation,
} from "../../data/rtk/academic";
import { CenteredEmptyState } from "../../components/query-state/QueryStates";
import { handleError } from "../../utils";
import { Delete, Add } from "@mui/icons-material";
import PageCard from "../../components/feedback/PageCard";

const SessionsSection = () => {
  const { data: res, isLoading } = useGetSessionsQuery();
  const sessions = (res?.data as unknown as AcademicSession[]) ?? [];
  const [createSession, { isLoading: creating }] = useCreateSessionMutation();
  const [deleteSession] = useDeleteSessionMutation();

  const [name, setName] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);

  const handleCreate = async () => {
    if (!name || !startYear || !endYear) return toast.error("Fill all fields");
    try {
      await createSession({
        name,
        startYear: Number(startYear),
        endYear: Number(endYear),
        isCurrent,
      }).unwrap();
      toast.success("Session created!");
      setName("");
      setStartYear("");
      setEndYear("");
      setIsCurrent(false);
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  const handleDelete = async (id: string, sessionName: string) => {
    if (!window.confirm(`Delete session "${sessionName}"? This cannot be undone.`))
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
    >
      <div className="bg-[#F5FAFF] rounded-xl p-4 mb-5 grid gap-3">
        <Typography level="title-sm" sx={{ color: "#001F54" }}>
          Add New Session
        </Typography>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormControl required>
            <FormLabel>Name</FormLabel>
            <Input
              placeholder="e.g. 2025/2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
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
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isCurrent"
            checked={isCurrent}
            onChange={(e) => setIsCurrent(e.target.checked)}
            className="accent-[#001EC5]"
          />
          <label htmlFor="isCurrent" className="text-sm text-[#475569]">
            Mark as current session
          </label>
        </div>
        <div className="flex justify-end">
          <AppButton onClick={handleCreate} loading={creating} size="sm">
            <Add sx={{ fontSize: 16, mr: 0.5 }} /> Add Session
          </AppButton>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-6 text-[#94A3B8] text-sm">Loading…</div>
      ) : sessions.length === 0 ? (
        <CenteredEmptyState description="No sessions yet. Create one above." />
      ) : (
        <div className="grid gap-2">
          {sessions.map((s) => (
            <div
              key={s._id}
              className="flex items-center justify-between border border-[#E6ECFF] rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#001F54] text-sm">
                  {s.name}
                </span>
                {(s as any).isCurrent && (
                  <span className="text-[11px] font-bold text-[#15803D] bg-[#D1FAE5] border border-[#6EE7B7] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Current
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDelete(s._id, s.name)}
                className="text-red-400 hover:text-red-600 transition-colors p-1"
              >
                <Delete sx={{ fontSize: 18 }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </PageCard>
  );
};

const TermsSection = () => {
  const { data: sessionsRes } = useGetSessionsQuery();
  const sessions = (sessionsRes?.data as unknown as AcademicSession[]) ?? [];

  const [selectedSession, setSelectedSession] = useState("");

  const { data: termsRes, isLoading } = useGetTermsQuery(
    selectedSession ? { sessionId: selectedSession } : undefined,
    { skip: !selectedSession },
  );
  const terms = (termsRes?.data as unknown as AcademicTerm[]) ?? [];

  const [createTerm, { isLoading: creating }] = useCreateTermMutation();
  const [deleteTerm] = useDeleteTermMutation();

  const [termName, setTermName] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);

  const PRESET_TERMS = ["First Semester", "Second Semester"];

  const handleCreate = async (name: string) => {
    if (!selectedSession) return toast.error("Select a session first");
    const finalName = name || termName;
    if (!finalName) return toast.error("Enter a semester name");
    try {
      await createTerm({
        sessionId: selectedSession,
        name: finalName,
        isCurrent,
      }).unwrap();
      toast.success(`"${finalName}" created!`);
      setTermName("");
      setIsCurrent(false);
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete semester "${name}"?`)) return;
    try {
      await deleteTerm(id).unwrap();
      toast.success("Semester deleted");
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  return (
    <PageCard
      title="Semesters"
      subtitle="Create First, Second Semesters under each session"
    >
      <FormControl size="sm" sx={{ mb: 4, maxWidth: 280 }}>
        <FormLabel>Select Session</FormLabel>
        <Select
          placeholder="Pick a session"
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

      {selectedSession && (
        <>
          <div className="mb-4">
            <Typography level="body-xs" textColor="neutral.500" mb={1}>
              Quick add:
            </Typography>
            <Stack direction="row" gap={1.5} flexWrap="wrap">
              {PRESET_TERMS.map((p) => (
                <button
                  key={p}
                  onClick={() => handleCreate(p)}
                  className="text-sm border border-[#001EC5] text-[#001EC5] rounded-lg px-3 py-1.5 hover:bg-[#001EC51A] transition-colors"
                >
                  + {p}
                </button>
              ))}
            </Stack>
          </div>

          <div className="bg-[#F5FAFF] rounded-xl p-4 mb-5 grid gap-3">
            <Typography level="title-sm" sx={{ color: "#001F54" }}>
              Custom Semester
            </Typography>
            <Stack
              direction="row"
              gap={2}
              alignItems="flex-end"
              flexWrap="wrap"
            >
              <FormControl sx={{ flex: 1, minWidth: 200 }}>
                <FormLabel>Semester Name</FormLabel>
                <Input
                  placeholder="e.g. First Semester"
                  value={termName}
                  onChange={(e) => setTermName(e.target.value)}
                />
              </FormControl>
              <div className="flex items-center gap-2 pb-1">
                <input
                  type="checkbox"
                  id="termCurrent"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="accent-[#001EC5]"
                />
                <label
                  htmlFor="termCurrent"
                  className="text-sm text-[#475569]"
                >
                  Current semester
                </label>
              </div>
              <AppButton
                size="sm"
                loading={creating}
                onClick={() => handleCreate("")}
              >
                <Add sx={{ fontSize: 16, mr: 0.5 }} /> Add
              </AppButton>
            </Stack>
          </div>

          {isLoading ? (
            <div className="text-center py-4 text-sm text-[#94A3B8]">
              Loading…
            </div>
          ) : terms.length === 0 ? (
            <CenteredEmptyState description="No semesters for this session yet." />
          ) : (
            <div className="grid gap-2">
              {terms.map((t) => (
                <div
                  key={t._id}
                  className="flex items-center justify-between border border-[#E6ECFF] rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#001F54] text-sm">
                      {t.name}
                    </span>
                    {(t as any).isCurrent && (
                      <StatusBadge status="open" size="sm" />
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(t._id, t.name)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Delete sx={{ fontSize: 18 }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!selectedSession && (
        <div className="text-center py-8 text-[#94A3B8] text-sm">
          ← Select a session above to manage its semesters
        </div>
      )}
    </PageCard>
  );
};

const SubjectsSection = () => {
  const { data: res, isLoading } = useGetSubjectsQuery();
  const subjects = (res?.data as unknown as AcademicSubject[]) ?? [];
  const [createSubject, { isLoading: creating }] = useCreateSubjectMutation();
  const [deleteSubject] = useDeleteSubjectMutation();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [creditUnit, setCreditUnit] = useState("2");

  const handleCreate = async () => {
    if (!name || !code) return toast.error("Name and code are required");
    try {
      await createSubject({
        name,
        code: code.toUpperCase(),
        creditUnit: Number(creditUnit) || undefined,
      }).unwrap();
      toast.success("Subject created!");
      setName("");
      setCode("");
      setCreditUnit("2");
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  const handleDelete = async (id: string, subjectName: string) => {
    if (
      !window.confirm(
        `Delete subject "${subjectName}"? This may affect existing results.`,
      )
    )
      return;
    try {
      await deleteSubject(id).unwrap();
      toast.success("Subject deleted");
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  return (
    <PageCard
      title="Subjects"
      subtitle="Add subjects that will appear in results and the bulk-upload template"
    >
      <div className="bg-[#F5FAFF] rounded-xl p-4 mb-5 grid gap-3">
        <Typography level="title-sm" sx={{ color: "#001F54" }}>
          Add New Subject
        </Typography>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormControl required>
            <FormLabel>Subject Name</FormLabel>
            <Input
              placeholder="e.g. Mathematics"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <FormControl required>
            <FormLabel>Code (used in Excel)</FormLabel>
            <Input
              placeholder="e.g. MATH101"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </FormControl>
        </div>
        <div className="flex justify-end">
          <AppButton onClick={handleCreate} loading={creating} size="sm">
            <Add sx={{ fontSize: 16, mr: 0.5 }} /> Add Subject
          </AppButton>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-6 text-sm text-[#94A3B8]">Loading…</div>
      ) : subjects.length === 0 ? (
        <CenteredEmptyState description="No subjects yet. Add some above." />
      ) : (
        <div className="grid gap-2">
          {subjects.map((s) => (
            <div
              key={s._id}
              className="flex items-center justify-between border border-[#E6ECFF] rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="bg-[#001EC51A] text-[#001EC5] text-xs font-bold px-2.5 py-1 rounded-lg">
                  {s.code}
                </span>
                <span className="font-medium text-[#001F54] text-sm">
                  {s.name}
                </span>
              </div>
              <button
                onClick={() => handleDelete(s._id, s.name)}
                className="text-red-400 hover:text-red-600 p-1"
              >
                <Delete sx={{ fontSize: 18 }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </PageCard>
  );
};

const AcademicSetupPage = () => (
  <Frame text="Academic Setup">
    <Typography level="body-sm" textColor="neutral.500" sx={{ mt: 2, mb: 3 }}>
      Configure sessions, terms, and subjects before uploading results.
      Subjects you create here will automatically appear as columns in the
      Excel template.
    </Typography>
    <div className="grid gap-6 pb-16">
      <SessionsSection />
      <TermsSection />
      <SubjectsSection />
    </div>
  </Frame>
);

export default AcademicSetupPage;
