import {
  Box,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  Option,
  Select,
  Stack,
  Typography,
} from "@mui/joy";
import Frame from "../../components/frame/Frame";
import ReportCard from "../../components/card/ReportCard";
import AppButton from "../../components/Button/AppButton";
import AppPagination from "../../components/pagination/Pagination";
import NoData from "../../components/no-data/NoData";
import { useEffect, useLayoutEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { MoreVert } from "@mui/icons-material";
import AppModal from "../../components/modal/modal";
import Input from "../../components/input/input";
import {
  useGetEstatesQuery,
  useGetEstateUnassignedStatsQuery,
} from "../../data/store/rtk/estate";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { handleError } from "../../utils";
import { TrashIcon } from "../../utils/icons";
import { useGetUsersQuery } from "../../data/store/rtk/user";
import AppSearch from "../../components/search/AppSearch";
import AvatarText from "../../components/avatar-text/AvatarText";
import AppLoader from "../../components/loader/AppLoader";

interface FormType {
  name: string;
  address: string;
  landmark: string;
  managers: string;
}

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedEstate, setSelectedEstate] = useState<Estate>();
  const [manager, setManager] = useState("");

  const toggleModal = (mode?: string) => {
    if (mode) setMode(mode);
    setIsOpen(!isOpen);
  };

  const [searchVar, setSearchVar] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const itemsPerPage = "10";
  const [currentPage, setCurrentPage] = useState(1);
  const [unassignLoading, setUnassignLoading] = useState(false);
  const { data, isLoading, refetch, isFetching } = useGetEstatesQuery({
    limit: itemsPerPage,
    page: searchParams.get("page")
      ? Number(searchParams.get("page")).toString() ||
        location.search.split("=")[0]
      : "",
    search: searchVar,
  });
  const { data: facilityManagerData } = useGetUsersQuery({
    type: "facilityManager",
  });
  const { data: unassignedEstates, refetch: refetchUnassign } =
    useGetEstateUnassignedStatsQuery();
  console.log({ data });

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    navigate(`?page=${page}`);
  };
  const [currentItems, setCurrentItems] = useState<Estate[] | undefined>();

  const totalPages = data ? Math.ceil(data.data.totalPages) : 0;

  const handleAssignManager = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.patch(
        `/estate/${selectedEstate?._id}/assign-manager`,
        {
          manager: manager,
        }
      );
      console.log({ res });
      refetch();
      toggleModal("");
      refetchUnassign();
      toast.success(res.data.message);
    } catch (error) {
      console.log({ error });
      toast.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const deleteEstate = async () => {
    setLoading(true);
    try {
      const res = await axios.delete(`/estate/${selectedEstate?._id}`);
      console.log({ res });
      refetch();
      setMode("deleted");
      toast.success(res.data.message);
    } catch (error) {
      console.log({ error });
      toast.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: selectedEstate?.name || "",
      address: selectedEstate?.address || "",
      landmark: selectedEstate?.landmark || "",
      managers: "",
    },
  });

  const onSubmit = async (data: FormType) => {
    console.log({
      ...data,
      managers: data.managers
        ? [...(selectedEstate?.managers || []), data.managers]
        : [...(selectedEstate?.managers || [])],
    });
    setLoading(true);
    try {
      const res = await axios.put(`/estate/${selectedEstate?._id}`, {
        ...data,
        managers: [...(selectedEstate?.managers || []), data.managers],
      });
      console.log({ res });
      refetch();
      toast.success(res.data.message);
      toggleModal();
    } catch (error) {
      console.log({ error });
      toast.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!location.search) {
      setSearchParams({ page: "1" });
      return;
    }
  }, []);

  useLayoutEffect(() => {
    setCurrentItems(data?.data.docs);
  }, [isLoading, isFetching, location, searchVar, location.search, data]);

  useEffect(() => {
    setValue("name", selectedEstate?.name || "");
    setValue("address", selectedEstate?.address || "");
    setValue("landmark", selectedEstate?.landmark || "");
  }, [selectedEstate]);
  const handleUnassign = async (id: string | undefined) => {
    setUnassignLoading(true);
    try {
      const res = await axios.patch(`/estate/${id}/unassign-manager`);
      console.log({ res });
      refetch();
      toast.success(res.data.message);
    } catch (error) {
      console.log({ error });
      toast.error(handleError(error));
      toggleModal();
    } finally {
      setUnassignLoading(false);
      toggleModal();
    }
  };

  return (
    <Frame text="Estates">
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
      <Stack py={4}>
        <div className="w-fit ml-auto flex gap-4 flex-wrap">
          <AppButton variant="outlined" onClick={() => navigate("add-estate")}>
            Add Estate
          </AppButton>
          <AppButton
            variant="outlined"
            onClick={() => navigate("/home/add-facility-manager")}
          >
            Add Manager
          </AppButton>
          <AppButton onClick={() => navigate("/home/find-artisan")}>
            Find Artisan
          </AppButton>
        </div>
      </Stack>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white p-4">
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
            gap={4}
          >
            <Typography level="title-lg">Estates</Typography>
            <AppSearch searchVar={searchVar} setSearchVar={setSearchVar} />
          </Stack>
          <Box
            minHeight={400}
            position={"relative"}
            className={"overflow-x-auto"}
          >
            <table className="w-full text-sm text-left rtl:text-right text-[#001F54]">
              <thead className="text-xs">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Address
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Landmark
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Estate manager
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading || isFetching || unassignLoading ? (
                  <tr className="py-8 my-8">
                    <td colSpan={7} className="py-8 text-center">
                      <AppLoader />
                    </td>
                  </tr>
                ) : currentItems?.length ? (
                  currentItems?.map((estate: Estate, idx) => (
                    <tr className="border-b font-medium" key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <AvatarText text={estate?.name} />
                      </td>
                      <td className="px-6 py-4">{estate.address}</td>
                      <td className="px-6 py-4">{estate.landmark}</td>
                      <td className="px-6 py-4">
                        {estate?.manager ? (
                          `${
                            estate?.manager?.firstName +
                            " " +
                            estate?.manager?.lastName
                          }`
                        ) : (
                          <span className="text-center">---</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Dropdown>
                          <MenuButton
                            slots={{ root: IconButton }}
                            slotProps={{
                              root: { variant: "outlined", color: "neutral" },
                            }}
                          >
                            <MoreVert />
                          </MenuButton>
                          <Menu>
                            {estate?.manager ? (
                              <MenuItem
                                onClick={() => {
                                  setSelectedEstate(estate);
                                  toggleModal("unassign");
                                }}
                              >
                                Unassign Manager
                              </MenuItem>
                            ) : (
                              <MenuItem
                                onClick={() => {
                                  setSelectedEstate(estate);
                                  toggleModal("assign");
                                }}
                              >
                                Assign Manager
                              </MenuItem>
                            )}
                            <MenuItem
                              onClick={() => {
                                setSelectedEstate(estate);
                                toggleModal("edit");
                              }}
                            >
                              Edit
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                setSelectedEstate(estate);
                                toggleModal("delete");
                              }}
                            >
                              Delete
                            </MenuItem>
                          </Menu>
                        </Dropdown>
                      </td>
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
            <div className="flex overflow-x-auto sm:justify-end py-2 px-6 gap-2 items-center">
              <AppPagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={onPageChange}
              />
              <span className="text-xs font-medium">of {totalPages}</span>
            </div>
          </Box>
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
      {/* modal */}
      <AppModal isOpen={isOpen} close={toggleModal}>
        {mode === "unassign" && (
          <Box>
            <Typography level="h2" textAlign={"center"} mb={2}>
              Unassign Manager?
            </Typography>
            <Typography level="body-md" textAlign={"center"} mb={2}>
              You are about to unassign this estate from the manager{" "}
              {selectedEstate?.manager?.firstName +
                " " +
                selectedEstate?.manager?.lastName}
            </Typography>
            <Typography level="body-md" textAlign={"center"} mb={2}>
              Do you want to proceed with this action?
            </Typography>
            <Stack mt={4}>
              <AppButton
                onClick={() => handleUnassign(selectedEstate?._id)}
                loading={unassignLoading}
                disabled={unassignLoading}
              >
                Yes, Unassign
              </AppButton>
              <AppButton variant="plain" onClick={() => toggleModal()}>
                No, Back
              </AppButton>
            </Stack>
          </Box>
        )}
        {mode === "assign" && (
          <Box>
            <Typography level="h3" mb={4}>
              Assign Managersss
            </Typography>
            <form onSubmit={handleAssignManager}>
              <div>
                <div className="space-y-2">
                  <label htmlFor="Facility Manager(Optional)">
                    Facility Manager
                  </label>

                  <Select onChange={(e, value) => setManager(value as string)}>
                    {facilityManagerData?.data.docs.map((item) => (
                      <Option value={item._id}>
                        {item.firstName + " " + item.lastName}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="flex mt-6">
                <AppButton
                  loading={loading}
                  disabled={loading}
                  className="w-full"
                >
                  Assign
                </AppButton>
              </div>
            </form>
          </Box>
        )}
        {mode === "edit" && (
          <Box>
            <Typography level="h2">Edit Estate</Typography>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
              <div className="space-y-4 mt-8">
                <div>
                  <Controller
                    name="name"
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field: { value, onChange } }) => (
                      <Input
                        label="Estate Name"
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                  {errors.name && (
                    <p className="text-[#dc2626] text-xs">
                      This field is required.
                    </p>
                  )}
                </div>
                <div>
                  <Controller
                    name="address"
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field: { value, onChange } }) => (
                      <Input
                        label="Estate Address"
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                  {errors.address && (
                    <p className="text-[#dc2626] text-xs">
                      This field is required.
                    </p>
                  )}
                </div>
                <div>
                  <Controller
                    name="landmark"
                    control={control}
                    rules={{
                      required: "This field is required",
                    }}
                    render={({ field: { value, onChange } }) => (
                      <Input
                        label="Address Landmark"
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                  {errors.landmark && (
                    <p className="text-[#dc2626] text-xs">
                      {errors.landmark.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="Facility Manager(Optional)">
                    Facility Manager(Optional)
                  </label>

                  <Controller
                    name="managers"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Select onChange={(e, value) => onChange(value)}>
                        {facilityManagerData?.data.docs.map((item) => (
                          <Option value={item._id}>
                            {item.firstName + " " + item.lastName}
                          </Option>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.managers && (
                    <p className="text-[#dc2626] text-xs">
                      This field is required.
                    </p>
                  )}
                </div>
              </div>
              <Stack marginTop={8}>
                <AppButton loading={loading} disabled={loading}>
                  Edit Estate
                </AppButton>
              </Stack>
            </form>
          </Box>
        )}
        {mode === "delete" && (
          <Box maxWidth={400}>
            <div className="flex justify-center">
              <TrashIcon />
            </div>
            <Typography level="h2" textAlign={"center"} mb={2}>
              Delete Property?
            </Typography>
            <Typography level="body-md" textAlign={"center"} mb={2}>
              You are about to this estate(name of the estate)
            </Typography>
            <Typography level="body-md" textAlign={"center"} mb={2}>
              Do you want to proceed with this action?
            </Typography>
            <Stack mt={4}>
              <AppButton
                onClick={() => deleteEstate}
                loading={loading}
                disabled={loading}
              >
                Yes, Delete
              </AppButton>
              <AppButton variant="plain" onClick={() => toggleModal()}>
                No, Back
              </AppButton>
            </Stack>
          </Box>
        )}
        {mode === "deleted" && (
          <Box maxWidth={400}>
            <div className="flex justify-center">
              <TrashIcon />
            </div>
            <Typography level="h2" textAlign={"center"} mb={2}>
              Property Deleted
            </Typography>
            <Typography level="body-md" textAlign={"center"} mb={2}>
              Estate has been deleted successfully.
            </Typography>
            <Stack mt={4}>
              <AppButton
                onClick={() => {
                  toggleModal("");
                }}
              >
                Thanks
              </AppButton>
            </Stack>
          </Box>
        )}
      </AppModal>
    </Frame>
  );
};

export default Home;
