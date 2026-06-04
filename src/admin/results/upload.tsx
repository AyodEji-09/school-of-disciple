import {
  Select,
  Option,
  Typography,
  Stack,
  FormControl,
  FormLabel,
  Input,
} from "@mui/joy";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "react-toastify";
import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import {
  useGetSessionsQuery,
  useGetTermsQuery,
  useGetSubjectsQuery,
  useCreateResultMutation,
} from "../../data/rtk/academic";
import { useGetUsersQuery } from "../../data/rtk/user";
import { handleError } from "../../utils";
import PageCard from "../../components/feedback/PageCard";
import ActionLink from "../../components/feedback/ActionLink";

interface SubjectEntry {
  subjectId: string;
  score: number;
}
interface FormValues {
  studentId: string;
  sessionId: string;
  termId: string;
  subjects: SubjectEntry[];
}

const UploadResultPage = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const coordinatorCenterId =
    typeof user?.center === "string" ? user.center : (user?.center as any)?._id;

  const { data: sessionsRes } = useGetSessionsQuery();
  const { data: subjectsRes } = useGetSubjectsQuery();
  const { data: studentsRes } = useGetUsersQuery({
    type: "user",
    ...(coordinatorCenterId ? { center: coordinatorCenterId } : {}),
  });
  const [createResult, { isLoading }] = useCreateResultMutation();

  const sessions = (sessionsRes?.data as unknown as AcademicSession[]) ?? [];
  const subjects = (subjectsRes?.data as unknown as AcademicSubject[]) ?? [];
  const students = studentsRes?.data?.docs ?? [];

  const {
    register,
    handleSubmit,
    control,
  } = useForm<FormValues>({
    defaultValues: {
      studentId: "",
      sessionId: "",
      termId: "",
      subjects: [{ subjectId: "", score: 0 }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "subjects",
  });
  const [selSession, setSelSession] = useState("");
  const [selTerm, setSelTerm] = useState("");
  const [selStudent, setSelStudent] = useState("");

  const { data: termsRes } = useGetTermsQuery(
    selSession ? { sessionId: selSession } : undefined,
    { skip: !selSession },
  );
  const terms = (termsRes?.data as unknown as AcademicTerm[]) ?? [];

  const onSubmit = async (values: FormValues) => {
    try {
      await createResult({
        studentId: selStudent,
        sessionId: selSession,
        termId: selTerm,
        subjects: values.subjects.map((s) => ({
          subjectId: s.subjectId,
          score: Number(s.score),
        })),
      }).unwrap();
      toast.success("Result uploaded successfully!");
      navigate("/dashboard/results");
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  return (
    <Frame text="Upload Student Result">
      <div className="max-w-2xl mx-auto mt-6 pb-16">
        <PageCard>
          <Typography level="title-lg" mb={1} sx={{ color: "#001F54" }}>
            New Result Entry
          </Typography>
          <Typography level="body-sm" textColor="neutral.500" mb={4}>
            Fill in the student details and enter scores for each subject.
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
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

            <div className="grid grid-cols-2 gap-4">
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
                <FormLabel>Term</FormLabel>
                <Select
                  placeholder={
                    selSession ? "Select term" : "Select session first"
                  }
                  value={selTerm}
                  onChange={(_, v) => setSelTerm(v as string)}
                  disabled={!selSession}
                >
                  {terms.map((t) => (
                    <Option key={t._id} value={t._id}>
                      {t.name}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div>
              <Typography level="title-sm" mb={2} sx={{ color: "#001F54" }}>
                Subjects & Scores
              </Typography>
              <div className="grid gap-3">
                {fields.map((field, idx) => (
                  <div key={field.id} className="flex gap-3 items-end">
                    <FormControl sx={{ flex: 1 }}>
                      <FormLabel>Subject</FormLabel>
                      <select
                        {...register(`subjects.${idx}.subjectId`, {
                          required: true,
                        })}
                        className="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm text-[#001F54] bg-white"
                      >
                        <option value="">Select subject</option>
                        {subjects.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name} ({s.code})
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormControl sx={{ width: 120 }}>
                      <FormLabel>Score (0-100)</FormLabel>
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
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="mb-1 text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <ActionLink
                type="button"
                onClick={() => append({ subjectId: "", score: 0 })}
                className="mt-3"
              >
                + Add Subject
              </ActionLink>
            </div>

            <Stack direction="row" gap={2} justifyContent="flex-end" mt={2}>
              <AppButton
                variant="outlined"
                onClick={() => navigate("/dashboard/results")}
              >
                Cancel
              </AppButton>
              <AppButton type="submit" loading={isLoading}>
                Save Result
              </AppButton>
            </Stack>
          </form>
        </PageCard>
      </div>
    </Frame>
  );
};

export default UploadResultPage;
