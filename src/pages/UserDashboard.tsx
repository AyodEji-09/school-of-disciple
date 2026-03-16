import { useRef, useState } from "react";
import { Avatar, Card, Chip, Stack, Typography } from "@mui/joy";
import { toast } from "react-toastify";
import { Empty } from "antd";
import moment from "moment";
import axios from "axios";
import { MdEdit, MdVerified } from "react-icons/md";
import { IoWarningOutline } from "react-icons/io5";
import { BsReceipt, BsBook } from "react-icons/bs";

import Frame from "../components/frame/Frame";
import AppButton from "../components/Button/AppButton";
import AppModal from "../components/modal/modal";
import OtpComponent from "../components/otp-component/OtpComponent";
import { handleError } from "../utils";
import { useAppDispatch, useAppSelector } from "../data/hooks";
import { selectUser } from "../data/selectors/authSelector";
import { loadUser } from "../data/reducers/userSlice";
import { useGetPaymentsQuery } from "../data/rtk/payment";
import { PulseLoader } from "react-spinners";

// ─── User Dashboard ───────────────────────────────────────────────────────────

const UserDashboard = () => {
  const user = useAppSelector(selectUser);

  return (
    <Frame text={`Welcome, ${user?.firstName ?? ""}`}>
      <div className="space-y-6 mt-6 pb-16">
        {/* Email verification banner — only shown when not verified */}
        {user && !user.emailVerified && <EmailVerificationBanner />}

        {/* Profile + Pending payments side by side */}
        <div className="grid md:grid-cols-3 gap-6">
          <ProfileCard />
          <div className="md:col-span-2">
            <PendingPayments />
          </div>
        </div>

        {/* Full-width payment history */}
        <PaymentHistory />
      </div>
    </Frame>
  );
};

export default UserDashboard;

// ─── Email Verification Banner ────────────────────────────────────────────────

const EmailVerificationBanner = () => {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const sendOtp = async () => {
    setSending(true);
    try {
      await axios.post("/auth/request-token", {
        email: user?.email,
        type: "verifyEmail",
      });
      toast.success("Verification code sent to your email");
      setIsModalOpen(true);
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setSending(false);
    }
  };

  const resendOtp = async () => {
    setSending(true);
    try {
      await axios.post("/auth/request-token", {
        email: user?.email,
        type: "verifyEmail",
      });
      toast.success("Code resent to your email");
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length < 6) {
      return toast.error("Please enter the 6-digit code");
    }
    setVerifying(true);
    try {
      await axios.post("/auth/verify-Email", {
        token: otp,
        email: user?.email,
      });
      toast.success("Email verified successfully!");
      setIsModalOpen(false);
      dispatch(loadUser());
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 bg-[#FFFBEB] border border-[#FCD34D] rounded-lg px-4 py-3 flex-wrap">
        <Stack direction="row" alignItems="center" gap={1.5}>
          <IoWarningOutline size={20} color="#D97706" />
          <Typography level="body-sm" textColor="#92400E" fontWeight="md">
            Your email address has not been verified. Verify it to secure your
            account.
          </Typography>
        </Stack>
        <AppButton
          type="button"
          onClick={sendOtp}
          loading={sending}
          disabled={sending}
        >
          Verify Email
        </AppButton>
      </div>

      <AppModal
        isOpen={isModalOpen}
        close={() => setIsModalOpen(false)}
        title="Verify Your Email"
        icon
      >
        <div className="w-[min(360px,80vw)] mt-2 space-y-5">
          <Typography level="body-sm" textColor="#6B7280">
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold text-[#001F54]">{user?.email}</span>
          </Typography>

          <div className="flex justify-center py-2">
            <OtpComponent onChange={setOtp} loading={verifying} />
          </div>

          <p className="text-xs text-center text-[#6B7280]">
            Didn't get the code?{" "}
            <button
              type="button"
              onClick={resendOtp}
              disabled={sending}
              className="font-semibold text-[#001EC5] hover:underline disabled:opacity-50"
            >
              Resend
            </button>
          </p>

          <Stack direction="row" gap={2}>
            <AppButton
              type="button"
              loading={verifying}
              disabled={verifying}
              onClick={verifyOtp}
            >
              Confirm
            </AppButton>
            <AppButton
              type="button"
              variant="outlined"
              onClick={() => setIsModalOpen(false)}
              disabled={verifying}
            >
              Cancel
            </AppButton>
          </Stack>
        </div>
      </AppModal>
    </>
  );
};

// ─── Profile Card ─────────────────────────────────────────────────────────────

const ProfileCard = () => {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please select an image file");
    }

    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);

    try {
      await axios.post("/user/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile picture updated");
      dispatch(loadUser());
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setUploading(false);
      // reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Card variant="outlined" sx={{ height: "fit-content" }}>
      {/* Avatar with upload overlay */}
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="relative w-fit">
          <Avatar
            src={user?.avatar?.url ?? ""}
            size="lg"
            sx={{ width: 80, height: 80, fontSize: 28 }}
          >
            {!user?.avatar?.url &&
              (user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "")}
          </Avatar>
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={uploading}
            className="absolute bottom-0 right-0 bg-[#001EC5] text-white rounded-full p-1 shadow-md hover:bg-[#0016A0] disabled:opacity-60 transition"
          >
            {uploading ? (
              <PulseLoader size={4} color="white" />
            ) : (
              <MdEdit size={14} />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Name + verification badge */}
        <div className="text-center">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            gap={0.5}
          >
            <Typography level="title-md" textColor="#001F54">
              {user?.firstName} {user?.lastName}
            </Typography>
            {user?.emailVerified && (
              <MdVerified size={16} color="#001EC5" title="Email verified" />
            )}
          </Stack>
          <Typography level="body-xs" textColor="#6B7280">
            {user?.center?.name ?? ""}
          </Typography>
        </div>
      </div>

      {/* Details list */}
      <div className="divide-y divide-[#F3F4F6] mt-2">
        <DetailRow label="Email" value={user?.email ?? "—"} />
        <DetailRow label="Phone" value={user?.phone ?? "—"} />
        <DetailRow
          label="Matric No."
          value={
            user?.matricNumber ? (
              <span className="font-semibold text-[#001EC5]">
                {user.matricNumber}
              </span>
            ) : (
              <Chip color="warning" variant="soft" size="sm">
                Awaiting
              </Chip>
            )
          }
        />
        <DetailRow
          label="Payment"
          value={
            user?.paymentStatus === "paid" ? (
              <Chip color="success" variant="soft" size="sm">
                Paid
              </Chip>
            ) : (
              <Chip color="danger" variant="soft" size="sm">
                Unpaid
              </Chip>
            )
          }
        />
      </div>
    </Card>
  );
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between items-center py-2 gap-2">
    <Typography level="body-xs" textColor="#9CA3AF" sx={{ flexShrink: 0 }}>
      {label}
    </Typography>
    <Typography
      level="body-sm"
      textColor="#001F54"
      sx={{ textAlign: "right", wordBreak: "break-word" }}
    >
      {value}
    </Typography>
  </div>
);

// ─── Pending Payments ─────────────────────────────────────────────────────────

const PendingPayments = () => {
  const user = useAppSelector(selectUser);
  const [loadingFee, setLoadingFee] = useState(false);

  const payRegistrationFee = async () => {
    setLoadingFee(true);
    try {
      const res = await axios.get<ApiResponseN<{ url: string }>>(
        "/payment/registration-fee",
      );
      const url = res.data.data?.url;
      if (url) window.open(url, "_blank");
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setLoadingFee(false);
    }
  };

  const registrationPaid = user?.paymentStatus === "paid";

  return (
    <div className="space-y-4 h-full">
      <Typography level="title-md" textColor="#001F54">
        Payments
      </Typography>

      {/* Registration fee card */}
      <Card
        variant="outlined"
        sx={{
          borderColor: registrationPaid ? "#D1FAE5" : "#FEE2E2",
          bgcolor: registrationPaid ? "#F0FDF4" : "#FFF5F5",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={2}
          flexWrap="wrap"
        >
          <Stack direction="row" gap={2} alignItems="flex-start">
            <div
              className={`p-2 rounded-lg ${
                registrationPaid ? "bg-[#D1FAE5]" : "bg-[#FEE2E2]"
              }`}
            >
              <BsReceipt
                size={22}
                color={registrationPaid ? "#059669" : "#DC2626"}
              />
            </div>
            <div>
              <Typography level="title-sm" textColor="#001F54">
                Registration Fee
              </Typography>
              <Typography level="body-xs" textColor="#6B7280" mt={0.5}>
                One-time fee required to complete your registration and receive
                your matric number.
              </Typography>
            </div>
          </Stack>
          <div className="shrink-0">
            {registrationPaid ? (
              <Chip color="success" variant="soft">
                Paid
              </Chip>
            ) : (
              <AppButton
                type="button"
                onClick={payRegistrationFee}
                loading={loadingFee}
                disabled={loadingFee}
              >
                Pay Now
              </AppButton>
            )}
          </div>
        </Stack>
      </Card>

      {/* Manuals card — coming soon */}
      <Card
        variant="outlined"
        sx={{ borderColor: "#E5E7EB", bgcolor: "#FAFAFA" }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={2}
          flexWrap="wrap"
        >
          <Stack direction="row" gap={2} alignItems="flex-start">
            <div className="p-2 rounded-lg bg-[#EFF6FF]">
              <BsBook size={22} color="#3B82F6" />
            </div>
            <div>
              <Typography level="title-sm" textColor="#001F54">
                Course Manuals
              </Typography>
              <Typography level="body-xs" textColor="#6B7280" mt={0.5}>
                Payment for course study materials and manuals.
              </Typography>
            </div>
          </Stack>
          <div className="shrink-0">
            <Chip color="neutral" variant="soft">
              Coming Soon
            </Chip>
          </div>
        </Stack>
      </Card>
    </div>
  );
};

// ─── Payment History ──────────────────────────────────────────────────────────

const PaymentHistory = () => {
  const {
    data: payments,
    isLoading,
    isFetching,
  } = useGetPaymentsQuery({
    limit: 20,
    page: 1,
  });

  return (
    <div>
      <Typography level="title-md" textColor="#001F54" mb={2}>
        Payment History
      </Typography>
      <Card variant="outlined" sx={{ p: 0, overflow: "hidden" }}>
        {isLoading || isFetching ? (
          <div className="flex justify-center items-center py-16">
            <PulseLoader size={8} color="#001EC5" />
          </div>
        ) : payments?.data?.docs?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-[#001F54]">
              <thead className="text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Reference</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.data.docs.map((payment) => (
                  <tr
                    key={payment._id}
                    className="border-b border-[#F3F4F6] hover:bg-[#F8FAFC] transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {moment(payment.createdAt).format("DD/MM/YYYY, HH:mm")}
                    </td>
                    <td className="px-6 py-4 text-[#6B7280] text-xs font-mono">
                      {payment._id}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      ${(payment.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <Chip
                        color={
                          payment.status === "paid"
                            ? "success"
                            : payment.status === "failed"
                              ? "danger"
                              : "warning"
                        }
                        variant="soft"
                        size="sm"
                      >
                        {payment.status}
                      </Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No payments yet"
            />
          </div>
        )}
      </Card>
    </div>
  );
};
