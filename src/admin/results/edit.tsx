import { Typography, Stack, FormControl, FormLabel, Input } from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "react-toastify";
import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import {
  useGetResultByIdQuery,
  useUpdateResultMutation,
  useGetSubjectsQuery,
} from "../../data/rtk/academic";
import { handleError } from "../../utils";
import PageCard from "../../components/feedback/PageCard";
import { PageLoader } from "../../components/query-state/QueryStates";

interface SubjectEntry {
  subjectId: string;
  score: number;
}
interface FormValues {
  subjects: SubjectEntry[];
}

const EditResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: resultRes, isLoading } = useGetResultByIdQuery(id!);
  const { data: subjectsRes } = useGetSubjectsQuery();
  const [updateResult, { isLoading: saving }] = useUpdateResultMutation();
  const subjects = (subjectsRes?.data as unknown as AcademicSubject[]) ?? [];

  const { register, handleSubmit, reset, control } = useForm<FormValues>({
    defaultValues: { subjects: [] },
  });
  const { fields } = useFieldArray({ control, name: "subjects" });

  const result = resultRes?.data as unknown as StudentResult | undefined;

  useEffect(() => {
    if (result) {
      reset({
        subjects: result.subjects.map((s) => ({
          subjectId:
            typeof s.subjectId === "string"
              ? s.subjectId
              : (s.subjectId as AcademicSubject)._id,
          score: s.score,
        })),
      });
    }
  }, [result, reset]);

  const getSubjectName = (id: string) =>
    subjects.find((s) => s._id === id)?.name ?? id;

  const onSubmit = async (values: FormValues) => {
    try {
      await updateResult({
        id: id!,
        subjects: values.subjects.map((s) => ({
          subjectId: s.subjectId,
          score: Number(s.score),
        })),
      }).unwrap();
      toast.success("Result updated successfully!");
      navigate("/dashboard/results");
    } catch (err) {
      toast.error(handleError(err));
    }
  };

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
  const term = result.termId as any;

  return (
    <Frame text="Edit Result">
      <div className="max-w-2xl mx-auto mt-6 pb-16">
        <PageCard>
          <div className="bg-[#F5FAFF] rounded-xl p-4 mb-6 grid grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-[#94A3B8] text-xs block">Student</span>
              <span className="font-semibold text-[#001F54]">
                {student?.firstName} {student?.lastName}
              </span>
            </div>
            <div>
              <span className="text-[#94A3B8] text-xs block">Session</span>
              <span className="font-semibold text-[#001F54]">
                {session?.name}
              </span>
            </div>
            <div>
              <span className="text-[#94A3B8] text-xs block">Term</span>
              <span className="font-semibold text-[#001F54]">
                {term?.name}
              </span>
            </div>
          </div>

          <Typography level="title-md" mb={3} sx={{ color: "#001F54" }}>
            Edit Subject Scores
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {fields.map((field, idx) => {
              const subjectName = getSubjectName(field.subjectId);
              return (
                <div key={field.id} className="flex items-center gap-4">
                  <div className="flex-1 bg-[#F8FAFC] rounded-lg px-4 py-2.5 text-sm font-medium text-[#001F54]">
                    {subjectName}
                  </div>
                  <FormControl sx={{ width: 140 }}>
                    <FormLabel>Score (0–100)</FormLabel>
                    <Input
                      type="number"
                      slotProps={{ input: { min: 0, max: 100 } }}
                      {...register(`subjects.${idx}.score`, {
                        required: true,
                        min: 0,
                        max: 100,
                      })}
                    />
                  </FormControl>
                </div>
              );
            })}

            <Stack direction="row" gap={2} justifyContent="flex-end" mt={3}>
              <AppButton
                variant="outlined"
                onClick={() => navigate("/dashboard/results")}
              >
                Cancel
              </AppButton>
              <AppButton type="submit" loading={saving}>
                Save Changes
              </AppButton>
            </Stack>
          </form>
        </PageCard>
      </div>
    </Frame>
  );
};

export default EditResultPage;
