import { Box } from "@mui/joy";
import type { PropsWithChildren } from "react";

type Props = { img?: string };

const UseBox = ({
  children,
  img = "manholding.jpg",
}: PropsWithChildren<Props>) => {
  return (
    <Box component={"div"}>
      <div className="grid md:grid-cols-2">
        <div className="overflow-y-auto h-screen scrollbar-hide">
          <div className="max-w-lg mx-auto p-4 md:p-12">{children}</div>
        </div>
        <div className="overflow-hidden h-screen hidden md:block">
          <img
            src={`/images/${img}`}
            alt=""
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>
    </Box>
  );
};

export default UseBox;
