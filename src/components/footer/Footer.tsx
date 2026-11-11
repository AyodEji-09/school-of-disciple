import { Box } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleFaqClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/") {
      const elem = document.getElementById("faq");
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      }
      window.history.pushState(null, "", "/#faq");
    } else {
      navigate("/#faq");
    }
  };

  return (
    <Box component={"footer"} className="bg-navy text-on-primary pt-16 pb-10 mt-auto">
      <div className="max-w-custom mx-auto px-space-lg lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/15">
          <div className="md:col-span-4 flex flex-col items-start logo">
            <Link to={"/"} className="mb-4">
              <div className="flex items-center bg-surface-container-lowest/95 rounded-lg px-3 py-1.5">
                <img
                  src="/images/logo.png"
                  alt="School of Disciples Logo"
                  className="h-12 w-auto"
                />
                <img
                  src="/images/sod-logo.png"
                  alt="School of Disciples Logo"
                  className="h-12 w-auto"
                />
              </div>
            </Link>
            <p className="text-inverse-on-surface/80 text-sm leading-relaxed max-w-sm mt-1">
              Equipping and training dynamic disciples of Jesus Christ across
              North America to fulfill the Great Commission with integrity and
              spiritual excellence.
            </p>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-serif text-base font-bold text-on-primary mb-4">
              Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-inverse-on-surface/80 hover:text-on-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-inverse-on-surface/80 hover:text-on-primary transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/team"
                  className="text-inverse-on-surface/80 hover:text-on-primary transition-colors"
                >
                  Team
                </Link>
              </li>
              <li>
                <a
                  href="/#faq"
                  onClick={handleFaqClick}
                  className="text-inverse-on-surface/80 hover:text-on-primary transition-colors cursor-pointer"
                >
                  FAQ
                </a>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-inverse-on-surface/80 hover:text-on-primary transition-colors"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-serif text-base font-bold text-on-primary mb-4">
              Policies
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="#"
                  className="text-inverse-on-surface/80 hover:text-on-primary transition-colors"
                >
                  Terms and conditions
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-inverse-on-surface/80 hover:text-on-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-serif text-base font-bold text-on-primary mb-4">
              Contact us
            </h4>
            <div className="space-y-3">
              <a
                href="mailto:info@rccgnasod.org"
                className="flex items-center gap-3 text-inverse-on-surface/80 hover:text-on-primary transition-colors"
              >
                <svg
                  className="w-4 h-4 text-gold shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm font-medium">info@rccgnasod.org</span>
              </a>
              {/* <div className="flex items-center gap-4 text-white"> */}
              {/*   <a */}
              {/*     href="https://facebook.com" */}
              {/*     target="_blank" */}
              {/*     rel="noopener noreferrer" */}
              {/*     aria-label="Facebook" */}
              {/*   > */}
              {/*     <FaFacebookF /> */}
              {/*   </a> */}
              {/*   <a */}
              {/*     href="https://instagram.com" */}
              {/*     target="_blank" */}
              {/*     rel="noopener noreferrer" */}
              {/*     aria-label="Instagram" */}
              {/*   > */}
              {/*     <FaInstagram /> */}
              {/*   </a> */}
              {/*   <a */}
              {/*     href="https://linkedin.com" */}
              {/*     target="_blank" */}
              {/*     rel="noopener noreferrer" */}
              {/*     aria-label="LinkedIn" */}
              {/*   > */}
              {/*     <GrLinkedinOption /> */}
              {/*   </a> */}
              {/*   <a */}
              {/*     href="https://youtube.com" */}
              {/*     target="_blank" */}
              {/*     rel="noopener noreferrer" */}
              {/*     aria-label="YouTube" */}
              {/*   > */}
              {/*     <FaYoutube /> */}
              {/*   </a> */}
              {/* </div> */}
            </div>
          </div>
        </div>

        <div className="pt-8 flex items-center justify-center text-center text-xs text-inverse-on-surface/60">
          <p>© 2025 RCCG The Americas-1 School of Disciples. All rights reserved.</p>
        </div>
      </div>
    </Box>
  );
};

export default Footer;
