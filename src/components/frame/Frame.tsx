import { Box } from "@mui/joy";
import DefaultHeader from "../../components/default-header/DefaultHeader";
import Heading from "../../components/default-header/Heading";
import type { PropsWithChildren } from "react";

type Props = {
  text?: string;
  search?: boolean;
};
const Frame = ({
  text = "Welcome Vici Enterprises",
  children,
  search = false,
}: PropsWithChildren<Props>) => {
  return (
    <Box bgcolor={"#F5FAFF"} minHeight={"100vh"}>
      <DefaultHeader />
      <Box mt={8}>
        <div className="container mx-auto px-4">
          <Heading text={text} search={search} />
          <Box>{children}</Box>
        </div>
      </Box>
    </Box>
  );
};

export default Frame;
