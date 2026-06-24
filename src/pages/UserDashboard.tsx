import { useState } from "react";
import { Card, Chip, Stack, Typography } from "@mui/joy";
import { toast } from "react-toastify";
import moment from "moment";
import axios from "axios";
import { BsReceipt } from "react-icons/bs";

import Frame from "../components/frame/Frame";
import AppButton from "../components/Button/AppButton";
import { capitalizeWords, handleError } from "../utils";
import { useAppSelector } from "../data/hooks";
import { selectUser } from "../data/selectors/authSelector";
import { useGetUserPaymentsQuery } from "../data/rtk/payment";
import { useGetCurrentUserQuery } from "../data/rtk/user";
import {
  CenteredEmptyState,
  SectionSkeleton,
  TableSkeleton,
} from "../components/query-state/QueryStates";

// ─── User Dashboard ───────────────────────────────────────────────────────────

const UserDashboard = () => {
  const user = useAppSelector(selectUser);

  return (
    <Frame text={`Welcome, ${capitalizeWords(user?.firstName ?? "")}!`}>
      <div className="space-y-6 mt-6 pb-16">
        <ProfileCard />
        <PendingPayments />
        <PaymentHistory />
      </div>
    </Frame>
  );
};

export default UserDashboard;

const ProfileCard = () => {
  const user = useAppSelector(selectUser);
  const {
    data: userProfile,
    isLoading: isLoadingUserProfile,
    isFetching: isFetchingUserProfile,
  } = useGetCurrentUserQuery();

  const profileData = userProfile ? userProfile.data : undefined;
  const dashboardUser = profileData || user;
  const isCenterPending =
    Boolean(user?._id) &&
    Boolean(dashboardUser?.center) &&
    typeof dashboardUser?.center === "string" &&
    isFetchingUserProfile;
  const centerName =
    dashboardUser &&
    dashboardUser.center &&
    typeof dashboardUser.center !== "string"
      ? dashboardUser.center.name || "—"
      : isCenterPending
        ? "Loading..."
        : "—";

  if (isLoadingUserProfile && !profileData) {
    return <SectionSkeleton titleWidth={90} lineCount={5} />;
  }

  return (
    <Card variant="outlined" sx={{ height: "fit-content" }}>
      {/* Details list */}
      <div className="divide-y divide-[#F3F4F6] mt-2">
        <DetailRow
          label="Name"
          value={
            [user?.firstName, user?.lastName]
              .filter(Boolean)
              .map((name) => capitalizeWords(name!))
              .join(" ") || "—"
          }
        />
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
        <DetailRow label="Center" value={centerName} />
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
      if (url) window.location.href = url;
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
      {/* <Card
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
      </Card> */}
    </div>
  );
};

// ─── Payment History ──────────────────────────────────────────────────────────

const PaymentHistory = () => {
  const user = useAppSelector(selectUser);
  const { data: payments, isLoading } = useGetUserPaymentsQuery(
    {
      userId: user?._id || "",
      limit: 20,
      page: 1,
    },
    {
      skip: !user?._id,
    },
  );
  const paymentDocs = payments?.data?.docs || [];
  const hasPayments = paymentDocs.length > 0;

  return (
    <div>
      <Typography level="title-md" textColor="#001F54" mb={2}>
        Payment History
      </Typography>
      <Card variant="outlined" sx={{ p: 0, overflow: "hidden" }}>
        {isLoading && !hasPayments ? (
          <div className="px-4 py-4">
            <TableSkeleton columns={5} rows={4} />
          </div>
        ) : hasPayments ? (
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left text-[#001F54]">
              <thead className="text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Reference</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentDocs.map((payment) => (
                  <tr
                    key={payment._id}
                    className="border-b border-[#F3F4F6] hover:bg-[#F8FAFC] transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {moment(payment.createdAt).format("MM/DD/YYYY, HH:mm")}
                    </td>
                    <td className="px-6 py-4 text-[#6B7280] text-xs font-mono">
                      {payment._id}
                    </td>
                    <td className="px-6 py-4">
                      {payment.description || "Registration Fee"}
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
          <CenteredEmptyState description="No payments yet" />
        )}
      </Card>
    </div>
  );
};
