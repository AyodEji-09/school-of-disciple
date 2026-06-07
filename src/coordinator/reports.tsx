import { useEffect, useState } from "react";
import { Typography, Stack, FormControl, FormLabel, Input, Box } from "@mui/joy";
import { PictureAsPdf, Download } from "@mui/icons-material";
import Frame from "../components/frame/Frame";
import AppButton from "../components/Button/AppButton";
import { useAppSelector } from "../data/hooks";
import { selectUser } from "../data/selectors/authSelector";
import { useGetSessionsQuery } from "../data/rtk/academic";
import { handleError } from "../utils";
import { toast } from "react-toastify";
import axios from "axios";
import { TOKEN, useURL } from "../data/config";
import PageCard from "../components/feedback/PageCard";

const slugify = (s: string) => s.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

const CoordinatorReportsPage = () => {
  const user = useAppSelector(selectUser);
  const coordinatorCenterId =
    typeof user?.center === "string"
      ? user.center
      : (user?.center as any)?._id;
  const coordinatorCenterName =
    typeof user?.center === "string"
      ? null
      : (user?.center as any)?.name;

  const [sessionId, setSessionId] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: sessionsData = [] } = useGetSessionsQuery();
  const sessions = sessionsData as unknown as AcademicSession[];

  useEffect(() => {
    if (sessions.length > 0 && !sessionId) {
      const current = sessions.find((s) => s.isCurrent) ?? sessions[0];
      if (current) setSessionId(current._id);
    }
  }, [sessions, sessionId]);

  const selectedSession = sessions.find((s) => s._id === sessionId);
  const noCentre = !coordinatorCenterId;

  const handleDownload = async () => {
    if (!sessionId) return toast.error("Select a session");
    if (!coordinatorCenterId)
      return toast.error("No centre is assigned to your account");
    setBusy(true);
    try {
      const centerLabel = coordinatorCenterName ?? "my-centre";
      const sessionLabel = selectedSession?.name ?? "session";
      const filename = `my-centre-report-${slugify(centerLabel)}-${slugify(sessionLabel)}.pdf`;
      const res = await axios.get<Blob>(
        `${useURL}/academic/reports/center/${coordinatorCenterId}`,
        {
          params: { sessionId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem(TOKEN)}`,
          },
          responseType: "blob",
        },
      );
      const blobUrl = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Centre report downloaded");
    } catch (err) {
      toast.error(handleError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Frame text="My Centre Report">
      <div className="space-y-6 mt-6 pb-16">
        <PageCard title="Generate My Centre Report">
          <Stack
            direction="row"
            gap={3}
            flexWrap="wrap"
            alignItems="flex-end"
          >
            <FormControl size="sm" sx={{ minWidth: 220 }}>
              <FormLabel>Session *</FormLabel>
              <Input
                value={
                  selectedSession?.name ??
                  (sessions.length > 0 ? "Loading…" : "No sessions yet")
                }
                readOnly
                variant="soft"
              />
            </FormControl>

            <FormControl size="sm" sx={{ minWidth: 240 }}>
              <FormLabel>Centre</FormLabel>
              <Input
                value={coordinatorCenterName ?? "Not assigned"}
                readOnly
                variant="soft"
                color={noCentre ? "danger" : "neutral"}
              />
            </FormControl>
          </Stack>

          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: "1px solid #E6ECFF",
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr" },
            }}
          >
            <div className="border border-[#E6ECFF] rounded-2xl p-5 flex flex-col gap-3 bg-[#F8FAFC]">
              <div className="flex items-center gap-2 text-[#001EC5]">
                <PictureAsPdf />
                <Typography
                  level="title-md"
                  sx={{ color: "#001F54", fontWeight: 700 }}
                >
                  My Centre Report
                </Typography>
              </div>
              <Typography level="body-sm" textColor="neutral.600">
                PDF with summary, per-year analysis, and ranked student list
                for your centre.
              </Typography>
              {noCentre && (
                <Typography level="body-xs" sx={{ color: "#dc2626" }}>
                  Your account is not assigned to a centre. Contact an admin
                  to be assigned before generating reports.
                </Typography>
              )}
              <div className="mt-auto pt-1">
                <AppButton
                  type="button"
                  className="w-full"
                  onClick={handleDownload}
                  loading={busy}
                  disabled={!sessionId || noCentre}
                >
                  <Download sx={{ fontSize: 16, mr: 0.5 }} />
                  Download PDF
                </AppButton>
              </div>
            </div>
          </Box>
        </PageCard>

        <PageCard>
          <Typography level="title-sm" sx={{ color: "#001F54", mb: 1 }}>
            About this report
          </Typography>
          <Typography level="body-sm" textColor="neutral.600">
            Generates a PDF report for your centre only. The backend enforces
            this — even if the URL is tampered with, the server overrides the
            centre ID to the one assigned to your account.
          </Typography>
        </PageCard>
      </div>
    </Frame>
  );
};

export default CoordinatorReportsPage;
