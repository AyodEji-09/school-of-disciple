import {
  Select,
  Option,
  Typography,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Chip,
} from "@mui/joy";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import {
  useGetSessionsQuery,
  useGetYearsQuery,
  useCreateResultMutation,
  useUpdateResultMutation,
  useGetResultsQuery,
} from "../../data/rtk/academic";
import { useGetUsersQuery } from "../../data/rtk/user";
import { handleError } from "../../utils";
import PageCard from "../../components/feedback/PageCard";

const UploadResultPage = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const coordinatorCenterId =
    typeof user?.center === "string" ? user.center : (user?.center as any)?._id;

  const { data: sessionsData = [] } = useGetSessionsQuery();
  const [createResult, { isLoading: isCreating }] = useCreateResultMutation();
  const [updateResult, { isLoading: isUpdating }] = useUpdateResultMutation();

  const sessions = sessionsData as unknown as AcademicSession[];

  const [selSession, setSelSession] = useState("");
  const [selStudent, setSelStudent] = useState("");
  const [scores, setScores] = useState<Record<string, string>>({});

  const currentSession = useMemo(
    () => sessions.find((s) => s.isCurrent) ?? null,
    [sessions],
  );

  useEffect(() => {
    if (!selSession && currentSession) {
      setSelSession(currentSession._id);
    }
  }, [currentSession, selSession]);

  const selSessionData = useMemo(
    () => sessions.find((s) => s._id === selSession) ?? null,
    [sessions, selSession],
  );
  const admissionYear = selSessionData?.startYear;

  const { data: studentsRes } = useGetUsersQuery({
    type: "user",
    ...(coordinatorCenterId ? { center: coordinatorCenterId } : {}),
  });
  const allStudents = studentsRes?.data?.docs ?? [];
  const students = useMemo(() => {
    if (!admissionYear) return allStudents;
    const filtered = allStudents.filter(
      (s: any) => Number(s.admissionYear) === admissionYear,
    );
    return filtered.length > 0 ? filtered : allStudents;
  }, [allStudents, admissionYear]);

  const { data: yearsData = [] } = useGetYearsQuery(
    selSession ? { sessionId: selSession } : undefined,
    { skip: !selSession },
  );
  const years = [...(yearsData as unknown as AcademicYear[])].sort(
    (a, b) => a.number - b.number,
  );

  const { data: existingResults = [] } = useGetResultsQuery(
    selStudent && selSession ? { studentId: selStudent, sessionId: selSession } : undefined,
    { skip: !selStudent || !selSession },
  );
  const existingResult = useMemo(
    () => (existingResults as StudentResult[])?.[0] ?? null,
    [existingResults],
  );

  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    setScores({});
    setSelStudent("");
  }, [selSession]);

  useEffect(() => {
    if (!existingResult) return;
    const prefilled: Record<string, string> = {};
    for (const ys of existingResult.yearScores ?? []) {
      const yearId = typeof ys.yearId === "string" ? ys.yearId : (ys.yearId as any)?._id;
      if (yearId) {
        prefilled[yearId] = String(ys.score);
      }
    }
    setScores((prev) => ({ ...prev, ...prefilled }));
  }, [existingResult]);

  const onScoreChange = (yearId: string, value: string) => {
    setScores((prev) => ({ ...prev, [yearId]: value }));
  };

  const onSubmit = async () => {
    if (!selStudent) return toast.error("Select a student");
    if (!selSession) return toast.error("Select a session");

    const yearScores = years
      .map((y) => ({
        yearId: y._id,
        score: Number(scores[y._id] ?? 0),
      }))
      .filter((ys) => !Number.isNaN(ys.score));

    if (yearScores.length === 0) {
      return toast.error("Enter at least one year score");
    }

    try {
      if (existingResult) {
        await updateResult({
          id: existingResult._id,
          yearScores,
        }).unwrap();
        toast.success("Result updated successfully!");
      } else {
        await createResult({
          studentId: selStudent,
          sessionId: selSession,
          yearScores,
        }).unwrap();
        toast.success("Result uploaded successfully!");
      }
      navigate("/dashboard/results");
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  return (
    <Frame text="Upload Student Result">
      <div className="max-w-2xl mx-auto mt-6 pb-16">
        <PageCard>
          <Stack direction="row" alignItems="center" gap={1.5} mb={1}>
            <Typography level="title-lg" sx={{ color: "#001F54" }}>
              {existingResult ? "Edit Result" : "New Result Entry"}
            </Typography>
            {existingResult && (
              <Chip size="sm" color="primary" variant="soft">
                Editing existing
              </Chip>
            )}
          </Stack>
          <Typography level="body-sm" textColor="neutral.500" mb={4}>
            Pick a student and session, then enter a score (0–100) for each
            academic year. Leave a year blank to skip it.
          </Typography>

          <div className="grid gap-5">
            <FormControl required>
              <FormLabel>Session</FormLabel>
              <Select
                placeholder="Select session"
                value={selSession}
                onChange={(_, v) => setSelSession(v as string)}
              >
                {sessions.map((s) => (
                  <Option key={s._id} value={s._id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormControl>

            <FormControl required>
              <FormLabel>Student</FormLabel>
              <Select
                placeholder="Select student"
                value={selStudent}
                onChange={(_, v) => setSelStudent(v as string)}
              >
                {students.map((s) => (
                  <Option key={s._id} value={s._id}>
                    {s.firstName} {s.lastName} — {s.matricNumber}
                  </Option>
                ))}
              </Select>
            </FormControl>

            <div>
              <Typography level="title-sm" mb={2} sx={{ color: "#001F54" }}>
                Year Scores
              </Typography>
              {!selSession ? (
                <div className="text-sm text-[#94A3B8] bg-[#F8FAFC] border border-dashed border-[#E6ECFF] rounded-xl p-6 text-center">
                  Select a session to load its 10 academic years.
                </div>
              ) : years.length === 0 ? (
                <div className="text-sm text-[#94A3B8] bg-[#F8FAFC] border border-dashed border-[#E6ECFF] rounded-xl p-6 text-center">
                  This session has no years configured.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {years.map((y) => (
                    <div
                      key={y._id}
                      className="flex items-center gap-3 border border-[#E6ECFF] rounded-xl p-3"
                    >
                      <div className="w-24 shrink-0">
                        <Typography level="body-xs" textColor="neutral.500">
                          {y.name}
                        </Typography>
                      </div>
                      <FormControl sx={{ flex: 1 }}>
                        <Input
                          type="number"
                          placeholder="0–100"
                          slotProps={{ input: { min: 0, max: 100 } }}
                          value={scores[y._id] ?? ""}
                          onChange={(e) =>
                            onScoreChange(y._id, e.target.value)
                          }
                        />
                      </FormControl>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Stack direction="row" gap={2} justifyContent="flex-end" mt={2}>
              <AppButton
                variant="outlined"
                onClick={() => navigate("/dashboard/results")}
              >
                Cancel
              </AppButton>
              <AppButton onClick={onSubmit} loading={isLoading}>
                {existingResult ? "Update Result" : "Save Result"}
              </AppButton>
            </Stack>
          </div>
        </PageCard>
      </div>
    </Frame>
  );
};

export default UploadResultPage;
