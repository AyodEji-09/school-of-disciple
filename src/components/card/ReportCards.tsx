import React from "react";
import ReportCard from "./ReportCard";
import {
  useGetEstatesQuery,
  useGetEstateUnassignedStatsQuery,
} from "../../data/store/rtk/estate";
import { useGetUsersQuery } from "../../data/store/rtk/user";

const ReportCards = () => {
  const { data } = useGetEstatesQuery({
    limit: "10",
  });
  const { data: facilityManagerData } = useGetUsersQuery({
    type: "facilityManager",
  });
  const { data: unassignedEstates } = useGetEstateUnassignedStatsQuery();
  return (
    <div className="grid sm:grid-cols-3 gap-4 mt-8">
      <ReportCard
        title="Facility Manager"
        number={facilityManagerData?.data.totalDocs}
      />
      <ReportCard title="Estate" number={data?.data.totalDocs} />
      <ReportCard
        title="Unassigned properties"
        number={unassignedEstates?.data}
      />
    </div>
  );
};

export default ReportCards;
