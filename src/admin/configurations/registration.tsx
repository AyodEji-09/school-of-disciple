import {
  Box,
  FormControl,
  FormLabel,
  Option,
  Select,
  Stack,
  Typography,
} from "@mui/joy";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import moment from "moment";

import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import InputField from "../../components/input/input.component";
import AppModal from "../../components/modal/modal";
import PageCard from "../../components/feedback/PageCard";
import StatusBadge from "../../components/feedback/StatusBadge";
import {
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/feedback/TableShell";
import { handleError } from "../../utils";
import { WINDOW_STATUS } from "../../utils/status";
import {
  useGetRegistrationWindowQuery,
  useGetAllRegistrationWindowsQuery,
  useSetRegistrationWindowMutation,
  useUpdateRegistrationWindowMutation,
} from "../../data/rtk/registration";
import { useGetSessionsQuery } from "../../data/rtk/academic";
import {
  CenteredEmptyState,
  PageLoader,
} from "../../components/query-state/QueryStates";

interface RegFormType {
  sessionId: string;
  startDate: string;
  endDate: string;
}

const resolveWindowKey = (win?: RegistrationWindow | null) => {
  if (!win) return "not_configured" as const;
  const now = new Date();
  const start = new Date(win.startDate);
  const end = new Date(win.endDate);
  if (now < start) return "upcoming" as const;
  if (now > end) return "closed" as const;
  return "open" as const;
};

const RegistrationPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");

  const { data: currentWindowRes, isLoading: loadingCurrent } =
    useGetRegistrationWindowQuery();
  const { data: allWindowsRes, isLoading: loadingAll } =
    useGetAllRegistrationWindowsQuery({ page: 1, limit: 20 });
  const [setWindow, { isLoading: creating }] =
    useSetRegistrationWindowMutation();
  const [updateWindow, { isLoading: updating }] =
    useUpdateRegistrationWindowMutation();
  const { data: sessionsRes } = useGetSessionsQuery();

  const currentWindow = currentWindowRes?.data;
  const statusKey = resolveWindowKey(currentWindow);
  const isSubmitting = creating || updating;
  const sessions = sessionsRes ?? [];
  const currentSession = sessions.find((s: any) => s.isCurrent);
  const lastWindowSessionId =
    currentWindow && typeof currentWindow.sessionId === "object"
      ? (currentWindow.sessionId as any)?._id
      : currentWindow?.sessionId;
  const canCreateNewWindow =
    !currentWindow || (currentSession && currentSession._id !== lastWindowSessionId);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegFormType>({
    defaultValues: { sessionId: "", startDate: "", endDate: "" },
  });

  const openEditModal = () => {
    if (currentWindow) {
      setMode("edit");
      const sid =
        typeof currentWindow.sessionId === "object"
          ? (currentWindow.sessionId as any)?._id
          : currentWindow.sessionId;
      reset({
        sessionId: sid ?? "",
        startDate: moment(currentWindow.startDate).format("YYYY-MM-DDTHH:mm"),
        endDate: moment(currentWindow.endDate).format("YYYY-MM-DDTHH:mm"),
      });
    }
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    const currentSession = sessions.find((s: any) => s.isCurrent);
    setMode("create");
    reset({ sessionId: currentSession?._id ?? "", startDate: "", endDate: "" });
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (currentWindow) setMode("edit");
  }, [currentWindow]);

  const onSubmit = async (data: RegFormType) => {
    const payload = {
      sessionId: data.sessionId,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    };
    try {
      if (mode === "edit" && currentWindow?._id) {
        await updateWindow({ id: currentWindow._id, ...payload }).unwrap();
        toast.success("Registration window updated");
      } else {
        await setWindow(payload).unwrap();
        toast.success("Registration window created");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  if (loadingCurrent) {
    return (
      <Frame text="Registration Windows">
        <PageLoader label="Loading registration window…" />
      </Frame>
    );
  }

  return (
    <Frame text="Registration Windows">
      <div className="max-w-5xl mx-auto mt-6 pb-16 space-y-6">
        <PageCard>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <div className="space-y-1">
              <Typography level="body-sm" textColor="#6B7280">
                {statusKey === "upcoming"
                  ? "Upcoming Registration Window"
                  : statusKey === "open"
                    ? "Active Registration Window"
                    : "Registration Window"}
              </Typography>
              <Stack direction="row" alignItems="center" gap={1.5}>
                <Typography level="h4">
                  {currentWindow?.label ?? "No window configured yet"}
                </Typography>
                {currentWindow && (
                  <StatusBadge status={statusKey} map={WINDOW_STATUS} />
                )}
              </Stack>
              {currentWindow ? (
                <Typography level="body-sm" textColor="#6B7280">
                  {moment(currentWindow.startDate).format("MM/DD/YYYY, HH:mm")}{" "}
                  &mdash;{" "}
                  {moment(currentWindow.endDate).format("MM/DD/YYYY, HH:mm")}
                </Typography>
              ) : (
                <Typography level="body-sm" textColor="#9CA3AF">
                  No registration period configured. Set one to allow students
                  to register.
                </Typography>
              )}
            </div>

            <Stack direction="row" gap={2} flexShrink={0}>
              {canCreateNewWindow ? (
                <AppButton type="button" onClick={openCreateModal}>
                  {currentWindow ? "New Window" : "Set Window"}
                </AppButton>
              ) : statusKey === "open" || statusKey === "upcoming" ? (
                <AppButton type="button" onClick={openEditModal}>
                  {statusKey === "upcoming"
                    ? "Edit Upcoming Window"
                    : "Edit Window"}
                </AppButton>
              ) : (
                <>
                  {currentWindow && (
                    <AppButton
                      type="button"
                      variant="outlined"
                      onClick={openEditModal}
                    >
                      Edit Window
                    </AppButton>
                  )}
                  <AppButton type="button" onClick={openCreateModal}>
                    {currentWindow ? "New Window" : "Set Window"}
                  </AppButton>
                </>
              )}
            </Stack>
          </Stack>

          {statusKey === "upcoming" && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: "8px",
                bgcolor: "#FEF3C7",
                border: "1px solid #FDE68A",
              }}
            >
              <Typography level="body-sm" sx={{ color: "#92400E" }}>
                ⏳ This window hasn't opened yet. Edit the dates if needed.
              </Typography>
            </Box>
          )}
        </PageCard>

        <div>
          <Typography level="title-lg" mb={2} sx={{ color: "#001F54" }}>
            History
          </Typography>
          <PageCard padded={false}>
            {loadingAll ? (
              <div className="py-10 flex justify-center">
                <PageLoader label="Loading history…" />
              </div>
            ) : allWindowsRes?.data?.docs?.length ? (
              <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-sm text-left">
                  <TableHeader>
                    <tr>
                      <TableHeaderCell>Label</TableHeaderCell>
                      <TableHeaderCell>Start Date</TableHeaderCell>
                      <TableHeaderCell>End Date</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {allWindowsRes.data.docs.map((win) => {
                      const isCurrent = win._id === currentWindow?._id;
                      return (
                        <TableRow
                          key={win._id}
                          className={isCurrent ? "!bg-[#F0F4FF]" : ""}
                        >
                          <TableCell>
                            <Stack direction="row" alignItems="center" gap={1}>
                              {win.label}
                              {isCurrent && (
                                <span className="text-[10px] font-bold text-[#001EC5] bg-[#E0E7FF] px-2 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {moment(win.startDate).format("MM/DD/YYYY, HH:mm")}
                          </TableCell>
                          <TableCell>
                            {moment(win.endDate).format("MM/DD/YYYY, HH:mm")}
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              status={resolveWindowKey(win)}
                              map={WINDOW_STATUS}
                              size="sm"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </table>
              </div>
            ) : (
              <div className="py-10">
                <CenteredEmptyState description="No registration windows yet" />
              </div>
            )}
          </PageCard>
        </div>
      </div>

      <AppModal
        isOpen={isModalOpen}
        close={() => setIsModalOpen(false)}
        title={
          mode === "edit"
            ? "Update Registration Window"
            : "Set Registration Window"
        }
        icon
      >
        <div className="w-[min(440px,80vw)] mt-2">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <Controller
                  name="sessionId"
                  control={control}
                  rules={{ required: "Academic session is required" }}
                  render={({ field: { value, onChange } }) => (
                    <FormControl>
                      <FormLabel>Academic Session</FormLabel>
                      <Select
                        value={value}
                        onChange={(_, val) => onChange(val)}
                        placeholder="Select a session…"
                        disabled={mode === "create"}
                      >
                        {sessions
                          .filter((s: any) => s.isCurrent)
                          .map((s: any) => (
                            <Option key={s._id} value={s._id}>
                              {s.name}
                              {s.isCurrent ? " · Current" : ""}
                            </Option>
                          ))}
                      </Select>
                    </FormControl>
                  )}
                />
                {errors.sessionId && (
                  <p className="text-[#dc2626] text-xs mt-1">
                    {errors.sessionId.message}
                  </p>
                )}
              </div>
              <div>
                <Controller
                  name="startDate"
                  control={control}
                  rules={{ required: "Start date is required" }}
                  render={({ field: { value, onChange } }) => (
                    <InputField
                      label="Start Date & Time"
                      type="datetime-local"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                {errors.startDate && (
                  <p className="text-[#dc2626] text-xs mt-1">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div>
                <Controller
                  name="endDate"
                  control={control}
                  rules={{ required: "End date is required" }}
                  render={({ field: { value, onChange } }) => (
                    <InputField
                      label="End Date & Time"
                      type="datetime-local"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                {errors.endDate && (
                  <p className="text-[#dc2626] text-xs mt-1">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>
            <Stack direction="row" gap={2} mt={4}>
              <AppButton loading={isSubmitting} disabled={isSubmitting}>
                {mode === "edit" ? "Update Window" : "Set Window"}
              </AppButton>
              <AppButton
                type="button"
                variant="outlined"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </AppButton>
            </Stack>
          </form>
        </div>
      </AppModal>
    </Frame>
  );
};

export default RegistrationPage;
