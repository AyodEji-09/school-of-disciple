import { Box, Button, Card, Chip, Stack, Typography } from "@mui/joy";
import { PulseLoader } from "react-spinners";
import { useParams } from "react-router-dom";
import moment from "moment";
import { useState, useMemo } from "react";
import { toast } from "react-toastify";

import Frame from "../../components/frame/Frame";
import {
  useGetUserQuery,
  useUpdateCoordinatorDeactivationMutation,
} from "../../data/rtk/user";
import { formatCenterAddress, getUserFullName, handleError } from "../../utils";
import { parseEducationRows } from "../../pages/onboarding/helpers";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";

const PaymentUser = () => {
  const { id } = useParams();
  const viewer = useAppSelector(selectUser);
  const isAdmin = viewer?.type === "admin";

  const {
    data: user,
    isLoading,
    isFetching,
  } = useGetUserQuery(id ?? "", { skip: !id });

  const [deactivationLoading, setDeactivationLoading] = useState(false);
  const [updateDeactivation] = useUpdateCoordinatorDeactivationMutation();

  const currentUser = user?.data;
  const intakeData = currentUser?.intakeFormData;
  const personalInfo = intakeData?.personalInfo;
  const spiritual = intakeData?.spiritualExperience;
  const education = useMemo(() => parseEducationRows(intakeData?.educationalExperience), [intakeData]);
  const employment = intakeData?.employmentStatus;

  const center =
    currentUser?.center && typeof currentUser.center !== "string"
      ? currentUser.center
      : null;

  const initials =
    `${currentUser?.firstName?.[0] ?? ""}${currentUser?.lastName?.[0] ?? ""}`
      .toUpperCase()
      .slice(0, 2);

  const handleDeactivation = async (deactivated: boolean) => {
    if (!currentUser?._id) return;
    const action = deactivated ? "deactivate" : "reactivate";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    setDeactivationLoading(true);
    try {
      const res = await updateDeactivation({
        id: currentUser._id,
        deactivated,
      }).unwrap();
      toast.success(res.data.message || "User status updated");
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setDeactivationLoading(false);
    }
  };

  return (
    <Frame text="User Details">
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

                <Stack spacing={4}>
                  {/* Personal Section */}
                  <Box>
                    <Typography level="title-md" mb={2} color="primary">Personal Information</Typography>
                    <Stack spacing={1.5}>
                      <DetailRow label="Email" value={currentUser.email || "N/A"} />
                      <DetailRow label="Phone" value={currentUser.phone || "N/A"} />
                      <DetailRow label="Gender" value={personalInfo?.gender || currentUser.gender || "N/A"} />
                      <DetailRow 
                        label="Height" 
                        value={personalInfo?.height ? `${personalInfo.height} ${personalInfo.heightUnit || ""}` : "N/A"} 
                      />
                      <DetailRow 
                        label="Date of Birth" 
                        value={personalInfo?.dateOfBirth || (currentUser.birthday ? moment(currentUser.birthday).format("MM/DD/YYYY") : "N/A")} 
                      />
                      <DetailRow label="Marital Status" value={personalInfo?.maritalStatus || "N/A"} />
                      <DetailRow label="Nationality" value={personalInfo?.nationality || "N/A"} />
                    </Stack>
                  </Box>

                  {/* Contact Section */}
                  <Box>
                    <Typography level="title-md" mb={2} color="primary">Contact Details</Typography>
                    <Stack spacing={1.5}>
                      <DetailRow label="Residential Address" value={personalInfo?.residentialAddress || currentUser.address || "N/A"} />
                      <DetailRow label="Mailing Address - City" value={personalInfo?.mailingCity || "N/A"} />
                      <DetailRow label="Mailing Address - State" value={personalInfo?.mailingState || currentUser.state || "N/A"} />
                      <DetailRow label="Mailing Address - Zip / Postal Code" value={personalInfo?.mailingZipCode || "N/A"} />
                      <DetailRow label="Home Phone" value={personalInfo?.homePhone || "N/A"} />
                      <DetailRow label="Office Phone" value={personalInfo?.officePhone || "N/A"} />
                    </Stack>
                  </Box>

                  {/* Academic & Center */}
                  <Box>
                    <Typography level="title-md" mb={2} color="primary">Academic & Center</Typography>
                    <Stack spacing={1.5}>
                      <DetailRow label="Center" value={center?.name || "N/A"} />
                      <DetailRow label="Center Address" value={formatCenterAddress(center)} />
                      <DetailRow label="Matric Number" value={currentUser.matricNumber || "N/A"} />
                      <DetailRow label="Department" value={currentUser.departmentCode || "N/A"} />
                      <DetailRow label="Admission Year" value={currentUser.admissionYear?.toString() || "N/A"} />
                      <DetailRow 
                        label="Reg. Payment Status" 
                        value={
                          <Chip 
                            size="sm" 
                            variant="soft" 
                            color={currentUser.paymentStatus === "paid" ? "success" : currentUser.paymentStatus === "pending" ? "warning" : "danger"}
                            className="capitalize"
                          >
                            {currentUser.paymentStatus || "pending"}
                          </Chip>
                        } 
                        valueIsNode
                      />
                    </Stack>
                  </Box>

                  {/* Educational Experience */}
                  <Box>
                    <Typography level="title-md" mb={2} color="primary">Educational Experience</Typography>
                    <Stack spacing={1.5}>
                      {education.filter(r => r.school).length > 0 ? (
                        education.filter(r => r.school).map((row, idx) => (
                          <DetailRow 
                            key={idx} 
                            label={`School Record ${idx + 1}`} 
                            value={`${row.school} (${row.qualification} • ${row.date})`} 
                          />
                        ))
                      ) : (
                        <DetailRow label="Records" value="No educational records provided." />
                      )}
                    </Stack>
                  </Box>

                  {/* Employment Status */}
                  <Box>
                    <Typography level="title-md" mb={2} color="primary">Employment Status</Typography>
                    <Stack spacing={1.5}>
                      <DetailRow label="Status" value={employment?.status || "N/A"} />
                      <DetailRow label="Family Annual Income" value={employment?.familyAnnualIncome || "N/A"} />
                    </Stack>
                  </Box>

                  {/* Spiritual Experience */}
                  <Box>
                    <Typography level="title-md" mb={2} color="primary">Spiritual Experience</Typography>
                    <Stack spacing={1.5}>
                      <DetailRow label="Born Again" value={spiritual?.bornAgain || "N/A"} />
                      <DetailRow label="Born Again When" value={spiritual?.bornAgainWhen || "N/A"} />
                      <DetailRow label="Holy Ghost Baptized" value={spiritual?.holyGhostBaptized || "N/A"} />
                      <DetailRow label="Water Baptized" value={spiritual?.waterImmersionBaptized || "N/A"} />
                      <DetailRow label="Church Name" value={spiritual?.churchName || "N/A"} />
                    </Stack>
                  </Box>

                  {/* Date Joined */}
                  <DetailRow 
                    label="Date Joined" 
                    value={currentUser.createdAt ? moment(currentUser.createdAt).format("MM/DD/YYYY") : "N/A"} 
                  />
                </Stack>

                {isAdmin && (
                  <div className="mt-10 pt-6 border-t border-[#E7EAF0]">
                    <Typography level="title-md" mb={2}>
                      Administrative Actions
                    </Typography>
                    <Stack direction="row" gap={2}>
                      {currentUser?.deactivated ? (
                        <Button
                          loading={deactivationLoading}
                          onClick={() => handleDeactivation(false)}
                          color="success"
                        >
                          Reactivate User Account
                        </Button>
                      ) : (
                        <Button
                          loading={deactivationLoading}
                          onClick={() => handleDeactivation(true)}
                          color="danger"
                        >
                          Deactivate User Account
                        </Button>
                      )}
                    </Stack>
                  </div>
                )}
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

const DetailRow = ({
  label,
  value,
  valueIsNode = false,
}: {
  label: string;
  value: React.ReactNode;
  valueIsNode?: boolean;
}) => {
  return (
    <div className="flex justify-between gap-4 items-center border-b pb-2">
      <Typography level="body-sm" textColor={"#000000"} sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      {valueIsNode ? (
        <div>{value}</div>
      ) : (
        <Typography level="body-sm" textAlign={"right"} textColor="neutral">
          {value as string}
        </Typography>
      )}
    </div>
  );
};
