import { Stack, Typography } from "@mui/joy";
import SearchInput from "../search-input/SearchInput";

type Props = {
  text: string;
  search: boolean;
};
const Heading = ({ text, search = false }: Props) => {
  return (
    <Stack
      direction={"row"}
      justifyContent={"space-between"}
      alignItems={"center"}
      gap={4}
    >
      <Typography level="h2" textColor={"#001F54"}>
        {text}
      </Typography>
      {search && <SearchInput />}
    </Stack>
  );
};

export default Heading;
