import { Stack, Typography } from "@mui/joy";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppSearch from "../../components/search/AppSearch";
import Frame from "../../components/frame/Frame";
import AvatarText from "../../components/avatar-text/AvatarText";
import { useGetUsersQuery } from "../../data/rtk/user";
import {
  CenteredEmptyState,
  TableSkeleton,
} from "../../components/query-state/QueryStates";
import AppButton from "../../components/Button/AppButton";
import { getUserFullName } from "../../utils";

const StudentsPage = () => {
  const [searchVar, setSearchVar] = useState("");
  const { data: students, isLoading } = useGetUsersQuery({
    type: "user",
    ...(searchVar ? { search: searchVar } : {}),
  });
  const navigate = useNavigate();
  const studentDocs = students?.data?.docs || [];

  const getCenterName = (entry: any) => {
    if (!entry?.center || typeof entry.center === "string") return "-";
    return entry.center.name || "-";
  };

  return (
    <Frame text="Students">
      <div className="bg-white p-4 overflow-x-auto mt-8">
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          gap={4}
        >
          <Typography level="title-lg" mb={4}>
            All Students
          </Typography>
          <AppSearch searchVar={searchVar} setSearchVar={setSearchVar} />
        </Stack>
        <div className={"overflow-x-auto w-full"}>
          <table className="w-full text-sm text-left rtl:text-right text-[#001F54]">
            <thead className="text-xs whitespace-nowrap">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Student Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Student Matric Number
                </th>
                <th scope="col" className="px-6 py-3">
                  Center
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="whitespace-nowrap">
              {isLoading && studentDocs.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <TableSkeleton columns={4} rows={10} />
                  </td>
                </tr>
              ) : studentDocs.length ? (
                studentDocs.map((student: any, idx: number) => (
                  <tr
                    className="border-b last:border-none font-medium"
                    key={idx}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <AvatarText text={getUserFullName(student)} />
                    </td>
                    <td className="px-6 py-4">{student?.matricNumber}</td>
                    <td className="px-6 py-4">{getCenterName(student)}</td>
                    <td className="px-6 py-4">
                      <AppButton
                        onClick={() =>
                          navigate(`/dashboard/students/${student._id}`)
                        }
                      >
                        View
                      </AppButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <CenteredEmptyState description="No students found" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Frame>
  );
};

export default StudentsPage;
