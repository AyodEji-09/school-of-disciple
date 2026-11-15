import { Link } from "react-router-dom";

interface OnboardingNavbarProps {
  onLogout: () => void;
}

const OnboardingNavbar = ({ onLogout }: OnboardingNavbarProps) => {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-surface-container-lowest border-b border-bordergray">
      <div className="max-w-custom mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex justify-between items-center">
        <Link to="/" className="flex items-center focus:outline-none">
          <img
            src="/images/logo.png"
            alt="School of Disciples Logo"
            className="h-9 sm:h-12 w-auto"
          />
          <img
            src="/images/sod-logo.png"
            alt="School of Disciples Logo"
            className="h-9 sm:h-12 w-auto"
          />
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center justify-center h-9 sm:h-10 px-4 sm:px-5 rounded-md border border-bordergray bg-surface-container-lowest hover:bg-coolgray text-charcoal hover:text-navy font-sans text-sm font-medium transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default OnboardingNavbar;
