import { Link } from "react-router-dom";
import AppButton from "../components/Button/AppButton";

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-9xl font-bold text-[#001EC5] mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-[#001F54] mb-4">
        Page Not Found
      </h2>
      <p className="text-gray-600 mb-8 max-w-md">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>
      <Link to="/">
        <AppButton>Go Back Home</AppButton>
      </Link>
    </div>
  );
};

export default NotFound;
