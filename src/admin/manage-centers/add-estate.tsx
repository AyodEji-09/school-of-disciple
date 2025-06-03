import { useState } from "react";
import UseBox from "../../components/usebox/UseBox";
import { Box, Stack, Typography, Select, Option } from "@mui/joy";
import Input from "../../components/input/input";
import AppButton from "../../components/Button/AppButton";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { handleError } from "../../utils";
import { useGetUsersQuery } from "../../data/store/rtk/user";
import { useGetEstatesQuery } from "../../data/store/rtk/estate";

interface FormType {
  name: string;
  address: string;
  landmark: string;
  managers?: string;
}
const AddEstate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultValue = {
    name: "",
    address: "",
    landmark: "",
    manager: "",
  };

  const { refetch } = useGetEstatesQuery({
    page: "1",
    limit: "10",
  });

  const { data } = useGetUsersQuery({ type: "facilityManager" });
  console.log({ data });

  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<FormType[]>([defaultValue]);
  const [address, setAddress] = useState("");
  const [inputValue, setInputValue] = useState<{
    description: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [suggestions, setSuggestions] = useState<
    { description: string; lat: number; lng: number }[]
  >([]);

  const removeItem = (propertyId: number) => {
    const filteredItem = properties.filter((_, id) => propertyId !== id);
    setProperties(filteredItem);
  };

  const addItem = () => {
    if (notFilledRequired()) {
      toast.error("complete previous estate details");
    } else {
      setProperties([...properties, defaultValue]);
    }
  };

  const notFilledRequired = (): boolean => {
    let count = 0;

    Object.values(properties[properties.length - 1]).forEach((val) => {
      if (val === "") {
        count++;
      }
    });
    if (count > 0) return true;
    return false;
  };

  const handleChange = (
    e: { target: { name: any; value: any } },
    id: number
  ) => {
    const { name, value } = e.target;
    const newProperty = properties.map((property, idx) => {
      if (id === idx) {
        return { ...property, [name]: value };
      } else {
        return property;
      }
    });
    setProperties(newProperty);
  };

  // const getAddressSuggestions = debounce(async (address: string) => {
  //   setLoading(true);
  //   try {
  //     const res = await axios.post(
  //       `/offerRequest/address-suggestion/${address}`
  //     );
  //     console.log({ res });

  //     setSuggestions(res.data.data);
  //   } catch (error) {
  //     console.log({ error });
  //     // toast.error(handleError(error));
  //   } finally {
  //     setLoading(false);
  //   }
  // }, 500);

  // const handleInputChange = (
  //   event: React.SyntheticEvent<Element, Event>,
  //   newInputValue: string
  // ) => {
  //   // setAddress(newInputValue);
  //   getAddressSuggestions(newInputValue); // Trigger API call on input change
  // };

  const onSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log({ properties });
    const data = properties[0];
    setLoading(true);

    try {
      const res = await axios.post("/estate", data);
      console.log({ res });
      refetch();
      navigate("/estates");
    } catch (error) {
      console.log({ error });
      toast.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <UseBox>
      <Stack mt={6}>
        <Typography level="h3">Add Estate</Typography>
      </Stack>
      <form onSubmit={onSubmit} className="mt-8">
        <div className="space-y-4 text-[#000C51]">
          {properties.map((property, idx) => (
            <Stack width={"100%"} gap={2}>
              <Stack gap={4} key={idx} width={"100%"}>
                <Input
                  name="name"
                  value={property.name}
                  onChange={(e?: any) => handleChange(e, idx)}
                  label="Estate Name"
                />
                <Input
                  name="address"
                  value={property.address}
                  onChange={(e?: any) => handleChange(e, idx)}
                  label="Estate Address"
                />
                {/* <div>
                  <label>Estate Address</label>
                  <Autocomplete
                    getOptionLabel={(suggestion) => suggestion.description}
                    onInputChange={handleInputChange}
                    loading={loading}
                    options={suggestions}
                    onChange={(e, value) => {
                      const newProperty = properties.map((property, id) => {
                        if (id === idx) {
                          return { ...property, address: value };
                        } else {
                          return property;
                        }
                      });
                      setProperties(newProperty);
                    }}
                    renderOption={(props, suggestion) => (
                      <AutocompleteOption {...props}>
                        <ListItemContent sx={{ fontSize: "sm" }}>
                          {suggestion.description}
                        </ListItemContent>
                      </AutocompleteOption>
                    )}
                  ></Autocomplete>
                </div> */}
                <Input
                  name="landmark"
                  value={property.landmark}
                  onChange={(e?: any) => handleChange(e, idx)}
                  label="Address Landmark"
                />
                <div>
                  <label htmlFor="Facility Manager(Optional)">
                    Facility Manager(Optional)
                  </label>
                  <Select
                    onChange={(event, value) => {
                      const newProperty = properties.map((property, id) => {
                        if (id === idx) {
                          return { ...property, manager: value as string };
                        } else {
                          return property;
                        }
                      });
                      setProperties(newProperty);
                    }}
                  >
                    {data?.data.docs.map((item) => (
                      <Option value={item._id}>
                        {item.firstName + " " + item.lastName}
                      </Option>
                    ))}
                  </Select>
                </div>
                {/* <Input
                  name="managers"
                  value={property.managers}
                  onChange={(e?: any) => handleChange(e, idx)}
                  label="Facility Manager(Optional)"
                /> */}
              </Stack>
              <Box>
                {properties.length > 1 && (
                  <Typography
                    textAlign={"right"}
                    level="body-sm"
                    onClick={() => removeItem(idx)}
                    className={"cursor-pointer"}
                    textColor={"red"}
                  >
                    Remove estate
                  </Typography>
                )}
              </Box>
            </Stack>
          ))}
          {/* <Typography
            textAlign={"right"}
            level="body-sm"
            onClick={() => addItem()}
            className={"cursor-pointer"}
          >
            Add another property
          </Typography> */}
        </div>
        <Stack marginTop={8}>
          <AppButton>Add Estate</AppButton>
        </Stack>
      </form>
    </UseBox>
  );
};

export default AddEstate;
