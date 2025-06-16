import { Stack, Typography } from "@mui/joy";
import ReportCard from "../../components/card/ReportCard";
import AppButton from "../../components/Button/AppButton";
import AppPagination from "../../components/pagination/Pagination";
import { useEffect, useLayoutEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getUserFullName } from "../../utils";
import AppSearch from "../../components/search/AppSearch";
import Frame from "../../components/frame/Frame";
import AvatarText from "../../components/avatar-text/AvatarText";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Frame text={`Welcome Admin`}>
      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        <ReportCard number={20} title="Center Managers" />
        <ReportCard number={20} title="Centers" />
        <ReportCard title="Students" number={20} />
      </div>
      <Stack py={4}>
        <div className="w-fit ml-auto flex gap-4 flex-wrap">
          <AppButton
            variant="outlined"
            onClick={() => navigate('/manage-centers')}
          >
            Add Center
          </AppButton>
          <AppButton
            variant="outlined"
            onClick={() => navigate("/dashboard/add-manager")}
          >
            Add Center Manager
          </AppButton>
        </div>
      </Stack>
      <FacilityManagerTable />
      {/* : <EstateTable /> */}
    </Frame>
  );
};

export default Dashboard;

const FacilityManagerTable = () => {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 pb-16">
      <div className="bg-white p-4 overflow-x-auto">
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          gap={4}
        >
          <Typography level="title-lg" mb={4}>
            Center Managers
          </Typography>
          <AppSearch />
        </Stack>
        <div className={"overflow-x-auto w-full"}>
          <table className="w-full text-sm text-left rtl:text-right text-[#001F54]">
            <thead className="text-xs whitespace-nowrap">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Phone Number
                </th>
                <th scope="col" className="px-6 py-3">
                  Center
                </th>
                <th scope="col" className="px-6 py-3">
                  Email
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b font-medium">
                <td className="px-6 py-4 whitespace-nowrap">
                  <AvatarText text={"User"} />
                </td>
                <td className="px-6 py-4">{"07055561754"}</td>
                <td className="px-6 py-4">{"center name"}</td>
                <td className="px-6 py-4">{"theayokayzy1@gmail.com"}</td>
                <td className="px-6 py-4">
                  <AppButton onClick={() => navigate('/dashboard/manager')}>View</AppButton>
                </td>
              </tr>
              <tr className="border-b font-medium">
                <td className="px-6 py-4 whitespace-nowrap">
                  <AvatarText text={"User"} />
                </td>
                <td className="px-6 py-4">{"07055561754"}</td>
                <td className="px-6 py-4">{"center name"}</td>
                <td className="px-6 py-4">{"theayokayzy1@gmail.com"}</td>
                <td className="px-6 py-4">
                  <AppButton onClick={() => navigate('/dashboard/manager')}>View</AppButton>
                </td>
              </tr>
              <tr className="border-b font-medium">
                <td className="px-6 py-4 whitespace-nowrap">
                  <AvatarText text={"User"} />
                </td>
                <td className="px-6 py-4">{"07055561754"}</td>
                <td className="px-6 py-4">{"center name"}</td>
                <td className="px-6 py-4">{"theayokayzy1@gmail.com"}</td>
                <td className="px-6 py-4">
                  <AppButton onClick={() => navigate('/dashboard/manager')}>View</AppButton>
                </td>
              </tr>
              <tr className="border-b font-medium">
                <td className="px-6 py-4 whitespace-nowrap">
                  <AvatarText text={"User"} />
                </td>
                <td className="px-6 py-4">{"07055561754"}</td>
                <td className="px-6 py-4">{"center name"}</td>
                <td className="px-6 py-4">{"theayokayzy1@gmail.com"}</td>
                <td className="px-6 py-4">
                  <AppButton onClick={() => navigate('/dashboard/manager')}>View</AppButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* <div className="hidden md:block bg-white p-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <div className="h-40 rounded-lg overflow-hidden">
              <img
                src={require("../../assets/images/db-img-1.png")}
                alt=""
                className="o object-cover w-full h-full"
              />
            </div>
          </div>
          <div className="">
            <div className="h-40 rounded-lg overflow-hidden">
              <img
                src={require("../../assets/images/db-img-2.png")}
                alt=""
                className="o object-cover w-full h-full"
              />
            </div>
          </div>
          <div className="">
            <div className="h-40 rounded-lg overflow-hidden">
              <img
                src={require("../../assets/images/db-img-3.png")}
                alt=""
                className="o object-cover w-full h-full"
              />
            </div>
          </div>
          <div className="col-span-2">
            <div className="h-40 rounded-lg overflow-hidden">
              <img
                src={require("../../assets/images/db-img-4.png")}
                alt=""
                className="o object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

const EstateTable = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const itemsPerPage = "10";
  const [currentPage, setCurrentPage] = useState(1);
  const user = useAppSelector(selectUser);

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchVar, setSearchVar] = useState("");
  const {
    data: EstateData,
    isLoading,
    isFetching,
  } = useGetEstatesQuery({
    limit: itemsPerPage,
    search: searchVar,
    page: searchParams.get("page")
      ? Number(searchParams.get("page")).toString() ||
        location.search.split("=")[0]
      : "",
    user: user?._id,
  });
  const onPageChange = (page: number) => {
    setCurrentPage(page);
    navigate(`?page=${page}`);
  };
  const [currentItems, setCurrentItems] = useState<Estate[] | undefined>();

  const totalPages = EstateData ? Math.ceil(EstateData.data.totalPages) : 0;

  useEffect(() => {
    if (!location.search) {
      setSearchParams({ page: "1" });
      return;
    }
    // handleFilteredData(filter);
    // setCurrentItems(data?.data.docs);
  }, []);

  useLayoutEffect(() => {
    setCurrentItems(EstateData?.data.docs);
    // setFilteredData(currentItems);
  }, [isLoading, isFetching, location, searchVar, location.search, EstateData]);
  return (
    <div className="grid md:grid-cols-3 gap-4 pb-16">
      <div className="md:col-span-2 bg-white p-4 overflow-x-auto">
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          gap={4}
        >
          <Typography level="title-lg" mb={4}>
            Estate
          </Typography>
          <AppSearch searchVar={searchVar} setSearchVar={setSearchVar} />
        </Stack>
        <div className={"overflow-x-auto w-full"}>
          <table className="w-full text-sm text-left rtl:text-right text-[#001F54]">
            <thead className="text-xs whitespace-nowrap">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Estate Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Estate Address
                </th>
                <th scope="col" className="px-6 py-3">
                  Landmark
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching ? (
                <tr className="py-8 my-8">
                  <td colSpan={7} className="py-8 text-center">
                    <AppLoader />
                  </td>
                </tr>
              ) : currentItems?.length ? (
                currentItems?.map((estate, idx) => (
                  <tr className="border-b font-medium" key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <AvatarText text={estate?.name} />
                    </td>
                    <td className="px-6 py-4">{estate?.address}</td>
                    <td className="px-6 py-4">{estate?.landmark}</td>
                  </tr>
                ))
              ) : (
                <tr className="py-8 my-8">
                  <td colSpan={8} className="py-8">
                    <NoData />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex overflow-x-auto sm:justify-end py-2 px-6 gap-2 items-center">
          <AppPagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
          <span className="text-xs font-medium">of {totalPages}</span>
        </div>
      </div>
      <div className="hidden md:block bg-white p-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <div className="h-40 rounded-lg overflow-hidden">
              <img
                src={require("../../assets/images/db-img-1.png")}
                alt=""
                className="o object-cover w-full h-full"
              />
            </div>
          </div>
          <div className="">
            <div className="h-40 rounded-lg overflow-hidden">
              <img
                src={require("../../assets/images/db-img-2.png")}
                alt=""
                className="o object-cover w-full h-full"
              />
            </div>
          </div>
          <div className="">
            <div className="h-40 rounded-lg overflow-hidden">
              <img
                src={require("../../assets/images/db-img-3.png")}
                alt=""
                className="o object-cover w-full h-full"
              />
            </div>
          </div>
          <div className="col-span-2">
            <div className="h-40 rounded-lg overflow-hidden">
              <img
                src={require("../../assets/images/db-img-4.png")}
                alt=""
                className="o object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
