import { Card, Stack, Typography } from "@mui/joy";
import { PulseLoader } from "react-spinners";
import { useParams } from "react-router-dom";
import moment from "moment";

import Frame from "../../components/frame/Frame";
import { useGetUserQuery } from "../../data/rtk/user";
import { formatCenterAddress, getUserFullName } from "../../utils";

const PaymentUser = () => {
  const { id } = useParams();
  const {
    data: user,
    isLoading,
    isFetching,
  } = useGetUserQuery(id ?? "", { skip: !id });

  const currentUser = user?.data;
  const center =
    currentUser?.center && typeof currentUser.center !== "string"
      ? currentUser.center
      : null;
  const initials =
    `${currentUser?.firstName?.[0] ?? ""}${currentUser?.lastName?.[0] ?? ""}`
      .toUpperCase()
      .slice(0, 2);

  return (
    <Frame text="">
      <div className="mt-8 pb-8">
        <Card variant="outlined">
          {isLoading || isFetching ? (
            <div className="flex min-h-72 items-center justify-center">
              <PulseLoader className="mx-auto" size="large" />
            </div>
          ) : currentUser ? (
            <div className="grid md:grid-cols-3 gap-6 p-2">
              <div className="md:col-span-1">
                <div className="rounded-lg overflow-hidden bg-white border border-[#E7EAF0]">
                  <div className="h-72 overflow-hidden">
                    {currentUser?.avatar?.url ? (
                      <img
                        className="h-full w-full object-cover"
                        src={currentUser.avatar.url}
                        alt={getUserFullName(currentUser)}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-[#E9EEF6] text-[#001F54] text-6xl font-semibold">
                        {initials || "U"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 rounded-lg border border-[#E7EAF0] bg-white p-5">
                <Typography level="h3" mb={3}>
                  {getUserFullName(currentUser)}
                </Typography>

                <Stack spacing={2}>
                  <Detail title="Email" value={currentUser?.email ?? "N/A"} />
                  <Detail
                    title="Matric Number"
                    value={currentUser?.matricNumber ?? "N/A"}
                  />
                  <Detail title="Phone" value={currentUser?.phone ?? "N/A"} />
                  <Detail
                    title="Address"
                    value={currentUser?.address ?? "N/A"}
                  />
                  <Detail title="Center" value={center?.name ?? "N/A"} />
                  <Detail
                    title="Center Address"
                    value={formatCenterAddress(center)}
                  />
                  <Detail
                    title="Registration Payment Status"
                    value={currentUser?.paymentStatus ?? "N/A"}
                  />
                  <Detail
                    title="Date Added"
                    value={
                      currentUser?.createdAt
                        ? moment(currentUser.createdAt).format("MM/DD/YYYY")
                        : "N/A"
                    }
                  />
                </Stack>
              </div>
            </div>
          ) : (
            <div className="flex min-h-72 items-center justify-center">
              <Typography level="body-md">User not found.</Typography>
            </div>
          )}
        </Card>
      </div>
    </Frame>
  );
};

export default PaymentUser;

const Detail = ({ title, value }: { title: string; value: string }) => {
  return (
    <div className="flex justify-between gap-4 items-center border-b pb-2">
      <Typography level="body-sm" textColor={"#000000"}>
        {title}
      </Typography>
      <Typography level="body-sm" textAlign={"right"}>
        {value}
      </Typography>
    </div>
  );
};
