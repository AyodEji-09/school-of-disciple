import { Select, Option, Typography, Stack, FormControl, FormLabel, Chip } from "@mui/joy";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import {
  useGetResultsQuery, useGetSessionsQuery, useGetTermsQuery, useSubmitForPublicationMutation,
} from "../../data/rtk/academic";
import { STATUS_COLOR, resolveName } from "../../utils/academic";
import { handleError } from "../../utils";

const SubmitPublicationPage = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const coordinatorCenterId = typeof user?.center === "string" ? user.center : (user?.center as any)?._id;

  const { data: sessionsRes } = useGetSessionsQuery();
  const [submitPub, { isLoading }] = useSubmitForPublicationMutation();

  const sessions = (sessionsRes?.data as unknown as AcademicSession[]) ?? [];

  const [sessionId, setSessionId] = useState("");
  const [termId, setTermId] = useState("");

  // Filter terms by selected session
  const { data: termsRes } = useGetTermsQuery(
    sessionId ? { sessionId } : undefined,
    { skip: !sessionId }
  );
  const terms = (termsRes?.data as unknown as AcademicTerm[]) ?? [];

  const { data: resultsRes } = useGetResultsQuery(
    { sessionId, termId, centerId: coordinatorCenterId, status: "draft" },
    { skip: !sessionId || !termId }
  );
  const draftResults = (resultsRes?.data as unknown as any[]) ?? [];

  const handleSubmit = async () => {
    if (!sessionId || !termId) return toast.error("Please select session and term");
    if (draftResults.length === 0) return toast.error("No draft results found for this session/term");
    try {
      await submitPub({ sessionId, termId, centerId: coordinatorCenterId }).unwrap();
      toast.success("Results submitted for publication successfully!");
      navigate("/dashboard/results");
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  return (
    <Frame text="Submit Results for Publication">
      <div className="max-w-2xl mx-auto mt-6 grid gap-5">
        <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-xl p-5">
          <Typography level="title-sm" textColor="#c2410c" mb={1}>⚠ Before you submit</Typography>
          <Typography level="body-sm" textColor="#9a3412">
            Submitting will lock all <strong>draft</strong> results for the chosen session/term and send them to
            an admin for approval. Results in draft status will no longer be editable.
          </Typography>
        </div>

        <div className="bg-white rounded-2xl border border-[#E6ECFF] shadow-sm p-8 grid gap-5">
          <div className="grid grid-cols-2 gap-4">
            <FormControl required>
              <FormLabel>Session</FormLabel>
              <Select placeholder="Select session" value={sessionId} onChange={(_, v) => { setSessionId(v as string); setTermId(""); }}>
                {sessions.map((s) => <Option key={s._id} value={s._id}>{s.name}</Option>)}
              </Select>
            </FormControl>
            <FormControl required>
              <FormLabel>Term</FormLabel>
              <Select
                placeholder={sessionId ? "Select term" : "Select session first"}
                value={termId}
                onChange={(_, v) => setTermId(v as string)}
                disabled={!sessionId}
              >
                {terms.map((t) => <Option key={t._id} value={t._id}>{t.name}</Option>)}
              </Select>
            </FormControl>
          </div>

          {sessionId && termId && (
            <div className="bg-[#F5FAFF] rounded-xl p-4">
              <Typography level="body-sm" textColor="neutral.600">
                <strong>{draftResults.length}</strong> draft result{draftResults.length !== 1 ? "s" : ""} found for this selection.
              </Typography>
              {draftResults.slice(0, 5).map((r: any) => {
                const student = r.studentId as any;
                return (
                  <div key={r._id} className="flex items-center justify-between mt-2 text-sm text-[#001F54]">
                    <span>{student?.firstName} {student?.lastName} <span className="text-[#94a3b8]">({student?.matricNumber})</span></span>
                    <Chip color={STATUS_COLOR[r.status as ResultStatus]} variant="soft" size="sm">
                      {r.status}
                    </Chip>
                  </div>
                );
              })}
              {draftResults.length > 5 && (
                <Typography level="body-xs" textColor="neutral.400" mt={1}>
                  and {draftResults.length - 5} more...
                </Typography>
              )}
            </div>
          )}

          <Stack direction="row" gap={2} justifyContent="flex-end">
            <AppButton variant="outlined" onClick={() => navigate("/dashboard/results")}>Cancel</AppButton>
            <AppButton onClick={handleSubmit} loading={isLoading}>Submit for Publication</AppButton>
          </Stack>
        </div>
      </div>
    </Frame>
  );
};

export default SubmitPublicationPage;
