import { useEffect, useState } from "react";
import { Card, Chip, Stack, Typography } from "@mui/joy";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { PulseLoader } from "react-spinners";
import { Empty } from "antd";
import moment from "moment";

import Frame from "../../components/frame/Frame";
import AppButton from "../../components/Button/AppButton";
import Input from "../../components/input/input.component";
import AppModal from "../../components/modal/modal";
import { handleError } from "../../utils";
import {
  useGetRegistrationWindowQuery,
  useGetAllRegistrationWindowsQuery,
  useSetRegistrationWindowMutation,
  useUpdateRegistrationWindowMutation,
} from "../../data/rtk/registration";

interface FormType {
  label: string;
  startDate: string;
  endDate: string;
}

type WindowStatus = {
  label: "Open" | "Upcoming" | "Closed" | "Not Configured";
  color: "success" | "warning" | "danger" | "neutral";
};

const getWindowStatus = (win?: RegistrationWindow | null): WindowStatus => {
  if (!win) return { label: "Not Configured", color: "neutral" };
  const now = new Date();
  const start = new Date(win.startDate);
  const end = new Date(win.endDate);
  if (now < start) return { label: "Upcoming", color: "warning" };
  if (now > end) return { label: "Closed", color: "danger" };
  return { label: "Open", color: "success" };
};

const RegistrationWindowPage = () => {
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

  const currentWindow = currentWindowRes?.data;
  const status = getWindowStatus(currentWindow);
  const isSubmitting = creating || updating;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormType>({
    defaultValues: { label: "", startDate: "", endDate: "" },
  });

  const openEditModal = () => {
    if (currentWindow) {
      setMode("edit");
      reset({
        label: currentWindow.label,
        startDate: moment(currentWindow.startDate).format("YYYY-MM-DDTHH:mm"),
        endDate: moment(currentWindow.endDate).format("YYYY-MM-DDTHH:mm"),
      });
    }
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setMode("create");
    reset({ label: "", startDate: "", endDate: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (currentWindow) {
      setMode("edit");
    }
  }, [currentWindow]);

  const onSubmit = async (data: FormType) => {
    const payload = {
      label: data.label,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    };

    try {
      if (mode === "edit" && currentWindow?._id) {
        await updateWindow({ id: currentWindow._id, ...payload }).unwrap();
        toast.success("Registration window updated successfully");
      } else {
        await setWindow(payload).unwrap();
        toast.success("Registration window created successfully");
      }
      closeModal();
    } catch (error) {
      toast.error(handleError(error));
    }
  };

  return (
    <Frame text="Registration Window">
      {loadingCurrent ? (
        <div className="flex justify-center items-center py-24">
          <PulseLoader size={10} color="#001EC5" />
        </div>
      ) : (
        <div className="space-y-6 mt-8 pb-16">
          {/* ── Active window card ── */}
          <Card variant="outlined">
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              flexWrap="wrap"
              gap={2}
            >
              <div className="space-y-1">
                <Typography level="body-sm" textColor="#6B7280">
                  Active Registration Window
                </Typography>
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <Typography level="h4">
                    {currentWindow?.label ?? "No window configured yet"}
                  </Typography>
                  <Chip color={status.color} variant="soft" size="md">
                    {status.label}
                  </Chip>
                </Stack>
                {currentWindow ? (
                  <>
                    <Typography level="body-sm" textColor="#6B7280">
                      {moment(currentWindow.startDate).format(
                        "DD/MM/YYYY, HH:mm",
                      )}{" "}
                      &mdash;{" "}
                      {moment(currentWindow.endDate).format(
                        "DD/MM/YYYY, HH:mm",
                      )}
                    </Typography>
                  </>
                ) : (
                  <Typography level="body-sm" textColor="#9CA3AF">
                    No registration period has been configured. Set one to allow
                    students to register.
                  </Typography>
                )}
              </div>

              <Stack direction="row" gap={2} flexShrink={0}>
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
              </Stack>
            </Stack>
          </Card>

          {/* ── History ── */}
          <div>
            <Typography level="title-lg" mb={2}>
              History
            </Typography>
            <Card variant="outlined" sx={{ p: 0, overflow: "hidden" }}>
              {loadingAll ? (
                <div className="flex justify-center py-12">
                  <PulseLoader size={8} color="#001EC5" />
                </div>
              ) : allWindowsRes?.data?.docs?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-[#001F54]">
                    <thead className="text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Label</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">
                          Start Date
                        </th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">
                          End Date
                        </th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allWindowsRes.data.docs.map((win) => {
                        const s = getWindowStatus(win);
                        const isCurrent = win._id === currentWindow?._id;
                        return (
                          <tr
                            key={win._id}
                            className={`border-b border-[#F3F4F6] ${
                              isCurrent ? "bg-[#F0F4FF]" : ""
                            }`}
                          >
                            <td className="px-6 py-4 font-medium">
                              <Stack
                                direction="row"
                                alignItems="center"
                                gap={1}
                              >
                                {win.label}
                                {isCurrent && (
                                  <span className="text-[10px] font-bold text-[#001EC5] bg-[#E0E7FF] px-2 py-0.5 rounded-full">
                                    Current
                                  </span>
                                )}
                              </Stack>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {moment(win.startDate).format(
                                "DD/MM/YYYY, HH:mm",
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {moment(win.endDate).format("DD/MM/YYYY, HH:mm")}
                            </td>
                            <td className="px-6 py-4">
                              <Chip color={s.color} variant="soft" size="sm">
                                {s.label}
                              </Chip>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No registration windows yet"
                  />
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      <AppModal
        isOpen={isModalOpen}
        close={closeModal}
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
              {/* Label */}
              <div>
                <Controller
                  name="label"
                  control={control}
                  rules={{ required: "Label is required" }}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      label="Label"
                      value={value}
                      onChange={onChange}
                      placeholder="e.g. 2025/2026 Academic Year"
                    />
                  )}
                />
                {errors.label && (
                  <p className="text-[#dc2626] text-xs mt-1">
                    {errors.label.message}
                  </p>
                )}
              </div>

              {/* Start date */}
              <div>
                <Controller
                  name="startDate"
                  control={control}
                  rules={{ required: "Start date is required" }}
                  render={({ field: { value, onChange } }) => (
                    <Input
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

              {/* End date */}
              <div>
                <Controller
                  name="endDate"
                  control={control}
                  rules={{ required: "End date is required" }}
                  render={({ field: { value, onChange } }) => (
                    <Input
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

            {/* Actions */}
            <Stack direction="row" gap={2} mt={4}>
              <AppButton loading={isSubmitting} disabled={isSubmitting}>
                {mode === "edit" ? "Update Window" : "Set Window"}
              </AppButton>
              <AppButton
                type="button"
                variant="outlined"
                onClick={closeModal}
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

export default RegistrationWindowPage;
