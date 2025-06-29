import {
  Box,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  Stack,
  Typography,
} from "@mui/joy";
import Frame from "../../components/frame/Frame";
import ReportCard from "../../components/card/ReportCard";
import AppButton from "../../components/Button/AppButton";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVert } from "@mui/icons-material";
import AppModal from "../../components/modal/modal";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { getUserFullName, handleError } from "../../utils";
import AppSearch from "../../components/search/AppSearch";
import AvatarText from "../../components/avatar-text/AvatarText";
import Input from "../../components/input/input.component";
import { useGetCentersQuery } from "../../data/rtk/center";
import { Empty } from "antd";
import { useAppSelector } from "../../data/hooks";
import { selectUser } from "../../data/selectors/authSelector";
import { PulseLoader } from "react-spinners";
import { useGetUsersQuery } from "../../data/rtk/user";

interface FormType {
  name: string;
  address: string;
}

const Centers = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>();

  const user = useAppSelector(selectUser);
  const {
    data: centerData,
    isLoading,
    isFetching,
    refetch: refetchCenters,
  } = useGetCentersQuery({ limit: 20, page: 1 });
  const { data: coordinators } = useGetUsersQuery({ type: "coordinator" });
  console.log({ centerData });

  const toggleModal = (mode?: string) => {
    if (mode) setMode(mode);
    console.log({ selectedCenter });

    // if (!isOpen) setSelectedCenter(null);
    setIsOpen(!isOpen);
  };

  const deleteCenter = async () => {
    setLoading(true);
    try {
      const res = await axios.delete(`/center/${selectedCenter?._id}`);
      console.log({ res });
      refetchCenters();
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
      name: selectedCenter?.name || "",
      address: selectedCenter?.address || "",
    },
  });

  const onSubmit = async (data: FormType) => {
    console.log({
      ...data,
    });
    setLoading(true);
    try {
      const res = await axios.patch(`/center/${selectedCenter?._id}`, {
        ...data,
      });
      console.log({ res });
      refetchCenters();
      toast.success(res.data.message);
      toggleModal();
    } catch (error) {
      console.log({ error });
      toast.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async (id: string | undefined) => {
    try {
      const res = await axios.patch(`/estate/${id}/unassign-manager`);
      console.log({ res });
      toast.success(res.data.message);
    } catch (error) {
      console.log({ error });
      toast.error(handleError(error));
      toggleModal();
    } finally {
      toggleModal();
    }
  };

  useEffect(() => {
    if (selectedCenter) {
      setValue("name", selectedCenter.name);
      setValue("address", selectedCenter.address);
    }
  }, [selectedCenter]);

  return (
    <Frame text="Centers">
      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        <ReportCard
          title="Center coordinator"
          number={coordinators?.data.totalItems || "0"}
        />
        <ReportCard
          title="Unassigned centers"
          number={
            (centerData?.data.totalItems || 0) -
            (coordinators?.data.totalItems || 0)
          }
        />
        <ReportCard
          title="Centers"
          number={centerData?.data.totalItems || "0"}
        />
      </div>
      {user?.type === "admin" && (
        <Stack pt={4}>
          <div className="w-fit ml-auto flex gap-4 flex-wrap">
            <AppButton
              variant="outlined"
              onClick={() => navigate("add-center")}
            >
              Add Center
            </AppButton>
          </div>
        </Stack>
      )}
      <div className="grid gap-4 mt-8">
        <div className="bg-white p-4">
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
            gap={4}
          >
            <Typography level="title-lg">Centers</Typography>
            <AppSearch />
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
                    Center manager
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading || isFetching ? (
                  <td colSpan={7}>
                    <div className="flex min-h-96 items-center justify-center">
                      <PulseLoader className="mx-auto" size="large" />
                    </div>
                  </td>
                ) : centerData?.data?.docs?.length ? (
                  centerData?.data?.docs?.map((center) => (
                    <tr className="border-b font-medium">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <AvatarText text={center?.name} />
                      </td>
                      <td className="px-6 py-4">{center?.address}</td>
                      <td className="px-6 py-4">
                        <span className="text-center">
                          {center?.manager
                            ? getUserFullName(center?.manager)
                            : "Nil"}
                        </span>
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
                            <MenuItem
                              onClick={() => {
                                setSelectedCenter(center);
                                toggleModal("edit");
                              }}
                            >
                              Edit
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                setSelectedCenter(center);
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
                  <td colSpan={7}>
                    <div className="flex min-h-96 items-center justify-center">
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </div>
                  </td>
                )}
              </tbody>
            </table>
          </Box>
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
            </Typography>
            <Typography level="body-md" textAlign={"center"} mb={2}>
              Do you want to proceed with this action?
            </Typography>
            <Stack mt={4}>
              <AppButton onClick={() => handleUnassign("")}>
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
              Assign Managers
            </Typography>
            <form onSubmit={() => {}}>
              <div>
                <div className="space-y-2">
                  <label htmlFor="Facility Manager(Optional)">
                    Facility Manager
                  </label>
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
            <Typography level="h2">Edit Center</Typography>
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
                        label="Center Name"
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
                        label="Center Address"
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
              </div>
              <Stack marginTop={8}>
                <AppButton loading={loading} disabled={loading}>
                  Edit Center
                </AppButton>
              </Stack>
            </form>
          </Box>
        )}
        {mode === "delete" && (
          <Box maxWidth={400}>
            <div className="flex justify-center">{/* <TrashIcon /> */}</div>
            <Typography level="h2" textAlign={"center"} mb={2}>
              Delete Center?
            </Typography>
            <Typography level="body-md" textAlign={"center"} mb={2}>
              You are about to delete this center
            </Typography>
            <Typography level="body-md" textAlign={"center"} mb={2}>
              Do you want to proceed with this action?
            </Typography>
            <Stack mt={4}>
              <AppButton
                onClick={() => deleteCenter()}
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
            <div className="flex justify-center">{/* <TrashIcon /> */}</div>
            <Typography level="h2" textAlign={"center"} mb={2}>
              Center Deleted
            </Typography>
            <Typography level="body-md" textAlign={"center"} mb={2}>
              Center has been deleted successfully.
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

export default Centers;
