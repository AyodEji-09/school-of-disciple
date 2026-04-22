import { MenuItem, Typography } from "@mui/joy";
import { Link, useNavigate } from "react-router-dom";

import { useAppDispatch } from "../../data/hooks";
import { logout } from "../../data/reducers/userSlice";

type Props = {
  onClose?: () => void;
};

const Profile = ({ onClose }: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <>
      <MenuItem component={Link} to="/profile" onClick={() => onClose?.()}>
        <Typography level="body-sm">View Profile</Typography>
      </MenuItem>
      <MenuItem
        color="danger"
        onClick={() => {
          onClose?.();
          dispatch(logout());
          navigate("/");
        }}
      >
        <Typography level="body-sm">Logout</Typography>
      </MenuItem>
    </>
  );
};

export default Profile;
