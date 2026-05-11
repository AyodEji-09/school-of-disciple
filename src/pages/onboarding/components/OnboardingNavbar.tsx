import { Link } from "react-router-dom";
import { Button } from "@mui/material";

interface OnboardingNavbarProps {
  onLogout: () => void;
}

const OnboardingNavbar = ({ onLogout }: OnboardingNavbarProps) => {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-200 px-4 py-2 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/">
          <div className="flex items-center">
            <img
              src="/images/logo.png"
              alt="School of Disciples Logo"
              className="h-10 md:h-12"
            />
            <img
              src="/images/rcg.png"
              alt="RCCG Logo"
              className="h-10 md:h-12"
            />
          </div>
        </Link>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onLogout}
          sx={{
            borderColor: "#E2E8F0",
            color: "#475569",
            "&:hover": {
              borderColor: "#CBD5E1",
              backgroundColor: "#F8FAFC",
            },
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default OnboardingNavbar;
