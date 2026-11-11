import { Link } from "react-router-dom";
import AppButton from "../components/Button/AppButton";

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24 text-center bg-surface-container-lowest">
      <div className="w-8 h-[2px] bg-gold mb-6" />
      <h1 className="text-8xl sm:text-9xl font-bold font-serif text-navy tracking-tight mb-4">
        404
      </h1>
      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-navy mb-3">
        Page Not Found
      </h2>
      <p className="text-slate text-base max-w-md mb-8 leading-relaxed">
        The page you are looking for might have been moved, renamed, or is
        temporarily unavailable.
      </p>
      <Link to="/">
        <AppButton>Go Back Home</AppButton>
      </Link>
    </div>
  );
};

export default NotFound;
