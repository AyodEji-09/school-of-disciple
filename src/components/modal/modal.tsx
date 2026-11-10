import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import { ModalDialog } from "@mui/joy";
import type { PropsWithChildren } from "react";

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
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: "16px",
            border: "1px solid #E4E1DA",
            backgroundColor: "#FFFFFF",
            p: 3.5,
            boxShadow: "0 4px 20px rgba(27, 42, 92, 0.08)",
            color: color || "#2B2F3A",
          }}
        >
          {icon && <ModalClose variant="plain" sx={{ m: 1 }} />}
          <Typography
            component="h2"
            id="modal-title"
            level="h4"
            textColor="#1B2A5C"
            fontWeight="lg"
            mb={1}
            textTransform={"capitalize"}
            sx={{ fontFamily: '"Source Serif 4", Georgia, serif' }}
          >
            {title}
          </Typography>
          <div
            className="scrollbar-hide"
            style={{ flex: 1, minHeight: 0, overflowY: "auto" }}
          >
            {children}
          </div>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default AppModal;
