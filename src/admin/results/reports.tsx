import { useEffect, useState } from "react";
import {
  Select,
  Option,
  Typography,
  Stack,
  FormControl,
  FormLabel,
  Box,
} from "@mui/joy";
import { PictureAsPdf, Download } from "@mui/icons-material";
import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import { useGetSessionsQuery } from "../../data/rtk/academic";
import { useGetCentersQuery } from "../../data/rtk/center";
import { handleError } from "../../utils";
import { toast } from "react-toastify";
import axios from "axios";
import { TOKEN, useURL } from "../../data/config";
import PageCard from "../../components/feedback/PageCard";

type ReportKind = "center" | "global";

const slugify = (s: string) => s.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

const ReportsPage = () => {
  const [sessionId, setSessionId] = useState("");
  const [centerId, setCenterId] = useState("");
  const [busy, setBusy] = useState<ReportKind | null>(null);

  const { data: sessionsData = [] } = useGetSessionsQuery();
  const { data: centersRes } = useGetCentersQuery({ page: 1, limit: 100 });
  const sessions = sessionsData as unknown as AcademicSession[];
  const centers = centersRes?.data?.docs ?? [];

  useEffect(() => {
    if (sessions.length > 0 && !sessionId) {
      const current = sessions.find((s) => s.isCurrent) ?? sessions[0];
      if (current) setSessionId(current._id);
    }
  }, [sessions, sessionId]);

  const selectedSession = sessions.find((s) => s._id === sessionId);
  const selectedCenter = centers.find((c) => c._id === centerId);

  const downloadPdf = async (
    kind: ReportKind,
    url: string,
    filename: string,
  ) => {
    setBusy(kind);
    try {
      const res = await axios.get<Blob>(url, {
        params: { sessionId },
        headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN)}` },
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success(
        `${kind === "center" ? "Centre" : "Global"} report downloaded`,
      );
    } catch (err) {
      toast.error(handleError(err));
    } finally {
      setBusy(null);
    }
  };

  const handleCenterReport = () => {
    if (!sessionId) return toast.error("Select a session");
    if (!centerId) return toast.error("Select a centre");
    const centerLabel = selectedCenter?.name ?? "centre";
    const sessionLabel = selectedSession?.name ?? "session";
    downloadPdf(
      "center",
      `${useURL}/academic/reports/center/${centerId}`,
      `centre-report-${slugify(centerLabel)}-${slugify(sessionLabel)}.pdf`,
    );
  };

  const handleGlobalReport = () => {
    if (!sessionId) return toast.error("Select a session");
    const sessionLabel = selectedSession?.name ?? "session";
    downloadPdf(
      "global",
      `${useURL}/academic/reports/global`,
      `global-report-${slugify(sessionLabel)}.pdf`,
    );
  };

  return (
    <Frame text="Academic Reports">
      <div className="space-y-6 mt-6 pb-16">
        <PageCard title="Generate Report">
          <Stack
            direction="row"
            gap={3}
            flexWrap="wrap"
            alignItems="flex-end"
          >
            <FormControl size="sm" sx={{ minWidth: 220 }}>
              <FormLabel>Session *</FormLabel>
              <Select
                placeholder="Select session"
                value={sessionId}
                onChange={(_, v) => setSessionId(v as string)}
              >
                {sessions.map((s) => (
                  <Option key={s._id} value={s._id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </FormControl>

            <FormControl size="sm" sx={{ minWidth: 240 }}>
              <FormLabel>Centre (for centre report)</FormLabel>
              <Select
                placeholder="Pick a centre"
                value={centerId}
                onChange={(_, v) => setCenterId(v as string)}
              >
                <Option value="">— Select a centre —</Option>
                {centers.map((c) => (
                  <Option key={c._id} value={c._id}>
                    {c.name}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: "1px solid #E6ECFF",
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            <ReportAction
              icon={<PictureAsPdf />}
              title="Centre Report"
              description="PDF with summary, per-year analysis, and ranked student list for the selected centre."
              disabled={!sessionId || !centerId}
              loading={busy === "center"}
              onClick={handleCenterReport}
            />
            <ReportAction
              icon={<PictureAsPdf />}
              title="Global Report"
              description="PDF with summary, per-centre breakdown, and per-year analysis across all centres."
              disabled={!sessionId}
              loading={busy === "global"}
              onClick={handleGlobalReport}
            />
          </Box>
        </PageCard>

        <PageCard>
          <Typography level="title-sm" sx={{ color: "#001F54", mb: 1 }}>
            About these reports
          </Typography>
          <Typography level="body-sm" textColor="neutral.600">
            Reports are generated as PDFs on demand by the backend. The file
            downloads automatically once ready. Use the analytics page for
            live JSON data on the same metrics.
          </Typography>
        </PageCard>
      </div>
    </Frame>
  );
};

const ReportAction = ({
  icon,
  title,
  description,
  disabled,
  loading,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}) => (
  <div className="border border-[#E6ECFF] rounded-2xl p-5 flex flex-col gap-3 bg-[#F8FAFC]">
    <div className="flex items-center gap-2 text-[#001EC5]">
      {icon}
      <Typography level="title-md" sx={{ color: "#001F54", fontWeight: 700 }}>
        {title}
      </Typography>
    </div>
    <Typography level="body-sm" textColor="neutral.600">
      {description}
    </Typography>
    <div className="mt-auto pt-1">
      <AppButton
        type="button"
        className="w-full"
        onClick={onClick}
        loading={loading}
        disabled={disabled}
      >
        <Download sx={{ fontSize: 16, mr: 0.5 }} />
        Download PDF
      </AppButton>
    </div>
  </div>
);

export default ReportsPage;
