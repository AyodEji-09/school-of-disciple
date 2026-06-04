import { Select, Option, Typography, Stack, FormControl, FormLabel } from "@mui/joy";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import {
  useGetSessionsQuery,
  useGetTermsQuery,
  useBulkUploadResultsMutation,
} from "../../data/rtk/academic";
import { handleError } from "../../utils";
import { CloudUpload, CheckCircle, ErrorOutline, FileDownload } from "@mui/icons-material";
import { TOKEN, useURL } from "../../data/config";
import axios from "axios";
import PageCard from "../../components/feedback/PageCard";

const BulkUploadPage = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const coordinatorCenterId =
    typeof user?.center === "string" ? user.center : (user?.center as any)?._id;

  const { data: sessionsRes } = useGetSessionsQuery();
  const sessions = (sessionsRes?.data as unknown as AcademicSession[]) ?? [];

  const [sessionId, setSessionId] = useState("");
  const [termId, setTermId] = useState("");

  const { data: termsRes } = useGetTermsQuery(
    sessionId ? { sessionId } : undefined,
    { skip: !sessionId },
  );
  const terms = (termsRes?.data as unknown as AcademicTerm[]) ?? [];

  const [bulkUpload, { isLoading }] = useBulkUploadResultsMutation();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<null | {
    total: number;
    processed: number;
    errors: number;
    details: any;
  }>(null);
  const [downloading, setDownloading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      const res = await axios.get(`${useURL}/academic/results/template`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN)}` },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "results-template.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Could not download template");
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmit = async () => {
    if (!file) return toast.error("Please select a file");
    if (!sessionId) return toast.error("Please select a session");
    if (!termId) return toast.error("Please select a term");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("sessionId", sessionId);
    fd.append("termId", termId);
    if (coordinatorCenterId) fd.append("centerId", coordinatorCenterId);

    try {
      const res = await bulkUpload(fd).unwrap();
      setResult((res as any).data);
      toast.success(
        `Processed ${(res as any).data?.processed} of ${(res as any).data?.total} rows`,
      );
    } catch (err) {
      toast.error(handleError(err));
    }
  };

  return (
    <Frame text="Bulk Upload Results">
      <div className="max-w-2xl mx-auto mt-6 grid gap-6 pb-16">
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <Typography level="title-sm" textColor="#1d4ed8" mb={1}>
                📋 File Format Guide
              </Typography>
              <Typography level="body-sm" textColor="#1e40af">
                Upload an <strong>.xlsx</strong> or <strong>.csv</strong> file.
                Required columns:
              </Typography>
              <ul className="mt-2 text-sm text-[#1e40af] list-disc list-inside space-y-1">
                <li>
                  <code>matricNumber</code> or <code>email</code> to identify
                  each student
                </li>
                <li>
                  One column per subject using the subject{" "}
                  <strong>code</strong> (e.g. <code>MATH101</code>), score
                  0–100
                </li>
              </ul>
            </div>
            <AppButton
              variant="outlined"
              onClick={handleDownloadTemplate}
              loading={downloading}
              size="sm"
            >
              <FileDownload sx={{ fontSize: 16, mr: 0.5 }} />
              Download Template
            </AppButton>
          </div>
        </div>

        <PageCard>
          <div className="grid grid-cols-2 gap-4">
            <FormControl required>
              <FormLabel>Session</FormLabel>
              <Select
                placeholder="Select session first"
                value={sessionId}
                onChange={(_, v) => {
                  setSessionId(v as string);
                  setTermId("");
                }}
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
                placeholder={sessionId ? "Select term" : "Select session first"}
                value={termId}
                onChange={(_, v) => setTermId(v as string)}
                disabled={!sessionId}
              >
                {terms.map((t) => (
                  <Option key={t._id} value={t._id}>
                    {t.name}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </div>

          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors mt-5 ${
              dragOver
                ? "border-[#001EC5] bg-[#EFF6FF]"
                : "border-[#CBD5E1] hover:border-[#001EC5]"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <CloudUpload sx={{ fontSize: 48, color: "#001EC5", mb: 1 }} />
            <Typography level="body-md" textColor="neutral.600">
              {file ? (
                <span className="font-semibold text-[#001F54]">
                  {file.name}
                </span>
              ) : (
                <>
                  Drag & drop your file here, or{" "}
                  <span className="text-[#001EC5] font-semibold">browse</span>
                </>
              )}
            </Typography>
            <Typography level="body-xs" textColor="neutral.400" sx={{ mt: 0.5 }}>
              Supported: .xlsx, .xls, .csv
            </Typography>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <Stack direction="row" gap={2} justifyContent="flex-end" mt={4}>
            <AppButton
              variant="outlined"
              onClick={() => navigate("/dashboard/results")}
            >
              Cancel
            </AppButton>
            <AppButton onClick={handleSubmit} loading={isLoading}>
              Upload & Process
            </AppButton>
          </Stack>
        </PageCard>

        {result && (
          <PageCard title="Upload Report">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Rows", value: result.total, color: "#475569" },
                { label: "Processed", value: result.processed, color: "#16a34a" },
                { label: "Errors", value: result.errors, color: "#dc2626" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="bg-[#F5FAFF] rounded-xl p-4 text-center"
                >
                  <Typography
                    level="h3"
                    sx={{ color, fontWeight: 800 }}
                  >
                    {value}
                  </Typography>
                  <Typography level="body-xs" textColor="neutral.500">
                    {label}
                  </Typography>
                </div>
              ))}
            </div>

            {result.details?.errors?.length > 0 && (
              <div className="mt-4">
                <Typography
                  level="title-sm"
                  sx={{ color: "#991B1B", mb: 1 }}
                >
                  <ErrorOutline sx={{ fontSize: 16, mr: 0.5 }} /> Errors
                </Typography>
                <div className="max-h-48 overflow-y-auto border border-red-100 rounded-lg divide-y divide-red-50">
                  {result.details.errors.map((e: any, i: number) => (
                    <div key={i} className="px-4 py-2 text-sm text-red-700">
                      Row {e.row}: {e.error}{" "}
                      {e.studentId ? `(${e.studentId})` : ""}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.processed > 0 && (
              <AppButton
                onClick={() => navigate("/dashboard/results")}
                className="mt-4"
              >
                <CheckCircle sx={{ fontSize: 16, mr: 0.5 }} /> View Results
              </AppButton>
            )}
          </PageCard>
        )}
      </div>
    </Frame>
  );
};

export default BulkUploadPage;
