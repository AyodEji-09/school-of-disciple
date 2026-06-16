import { Typography, Stack, FormControl, FormLabel, Input } from "@mui/joy";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import {
  useGetResultByIdQuery,
  useUpdateResultMutation,
  useGetYearsQuery,
} from "../../data/rtk/academic";
import { handleError, getUserFullName } from "../../utils";
import PageCard from "../../components/feedback/PageCard";
import { PageLoader } from "../../components/query-state/QueryStates";
import { resolveId } from "../../utils/academic";

const EditResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: result, isLoading } = useGetResultByIdQuery(id!);
  const sessionId = result ? resolveId(result.sessionId) : "";

  const { data: yearsData = [] } = useGetYearsQuery(
    sessionId ? { sessionId } : undefined,
    { skip: !sessionId },
  );
  const years = [...(yearsData as unknown as AcademicYear[])].sort(
    (a, b) => a.number - b.number,
  );

  const [updateResult, { isLoading: saving }] = useUpdateResultMutation();
  const [scores, setScores] = useState<Record<string, string>>({});
  const seededRef = useRef(false);

  useEffect(() => {
    if (result && years.length > 0 && !seededRef.current) {
      const next: Record<string, string> = {};
      years.forEach((y) => {
        const existing = (result.yearScores ?? []).find(
          (ys) => resolveId(ys.yearId) === y._id,
        );
        next[y._id] = existing ? String(existing.score) : "";
      });
      setScores(next);
      seededRef.current = true;
    }
  }, [result, years]);

  if (isLoading) {
    return (
      <Frame text="Edit Result">
        <PageLoader label="Loading result…" />
      </Frame>
    );
  }

  if (!result) {
    return (
      <Frame text="Edit Result">
        <div className="text-center py-24 text-[#475569]">Result not found.</div>
      </Frame>
    );
  }

  const student = result.studentId as any;
  const session = result.sessionId as any;

  const onSubmit = async () => {
    const yearScores = years
      .map((y) => {
        const raw = scores[y._id];
        if (raw === undefined || raw === "") return null;
        const value = Number(raw);
        if (Number.isNaN(value)) return null;
        return { yearId: y._id, score: value };
      })
      .filter((x): x is { yearId: string; score: number } => x !== null);

    if (yearScores.length === 0) {
      return toast.error("Enter at least one year score");
    }

    try {
      await updateResult({ id: id!, yearScores }).unwrap();
      toast.success("Result updated successfully!");
      navigate("/dashboard/results");
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  return (
    <Frame text="Edit Result">
      <div className="max-w-2xl mx-auto mt-6 pb-16">
        <PageCard>
          <div className="bg-[#F5FAFF] rounded-xl p-4 mb-6 grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-[#94A3B8] text-xs block">Student</span>
              <span className="font-semibold text-[#001F54]">
                {getUserFullName(student)}
              </span>
            </div>
            <div>
              <span className="text-[#94A3B8] text-xs block">Session</span>
              <span className="font-semibold text-[#001F54]">
                {session?.name}
              </span>
            </div>
          </div>

          <Typography level="title-md" mb={3} sx={{ color: "#001F54" }}>
            Edit Year Scores
          </Typography>
          <div className="grid gap-3">
            {years.map((y) => (
              <div
                key={y._id}
                className="flex items-center gap-4 border border-[#E6ECFF] rounded-xl p-3"
              >
                <div className="flex-1">
                  <Typography level="body-sm" sx={{ color: "#001F54" }} fontWeight={600}>
                    {y.name}
                  </Typography>
                </div>
                <FormControl sx={{ width: 160 }}>
                  <FormLabel>Score (0–100)</FormLabel>
                  <Input
                    type="number"
                    slotProps={{ input: { min: 0, max: 100 } }}
                    value={scores[y._id] ?? ""}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [y._id]: e.target.value,
                      }))
                    }
                  />
                </FormControl>
              </div>
            ))}
          </div>

          <Stack direction="row" gap={2} justifyContent="flex-end" mt={3}>
            <AppButton
              type="button"
              variant="outlined"
              onClick={() => navigate("/dashboard/results")}
            >
              Cancel
            </AppButton>
            <AppButton type="button" onClick={onSubmit} loading={saving}>
              Save Changes
            </AppButton>
          </Stack>
        </PageCard>
      </div>
    </Frame>
  );
};

export default EditResultPage;
