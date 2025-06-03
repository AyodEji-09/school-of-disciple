import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import { ModalDialog } from "@mui/joy";
import { PropsWithChildren } from "react";

type Props = {
  isOpen: boolean;
  close: () => void;
  title?: string;
  color?: string;
  icon?: boolean;
};

const AppModal = ({
  isOpen,
  close,
  children,
  title,
  color,
  icon,
}: PropsWithChildren<Props>) => {
  return (
    <>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={isOpen}
        onClose={close}
      >
        <ModalDialog
          layout="center"
          // size={size ?? "sm"}
          sx={{
            borderRadius: "md",
            p: 3,
            boxShadow: "lg",
            color: color || "#000000",
          }}
        >
          {icon && <ModalClose variant="plain" sx={{ m: 1 }} />}
          <Typography
            component="h2"
            id="modal-title"
            level="h4"
            textColor="inherit"
            fontWeight="lg"
            mb={1}
            textTransform={"capitalize"}
          >
            {title}
          </Typography>
          <div>{children}</div>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default AppModal;
