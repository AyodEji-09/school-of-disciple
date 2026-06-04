import { Box } from "@mui/joy";
import DefaultHeader from "../../components/default-header/DefaultHeader";
import Heading from "../../components/default-header/Heading";
import type { PropsWithChildren } from "react";

type Props = {
  text?: string;
  search?: boolean;
};
const Frame = ({
  text = "School of Disciples",
  search = false,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <DefaultHeader title="Overview">
      <div className="container mx-auto">
        <Heading text={text} search={search} />
        <Box>{children}</Box>
      </div>
    </DefaultHeader>
  );
};

export default Frame;
