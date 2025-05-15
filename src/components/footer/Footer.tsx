import { Box, Container } from "@mui/material";
import { Link } from "react-router-dom";
import { FaFacebookF } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import { GrLinkedinOption } from "react-icons/gr";
import { FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <Box component={"footer"} className="border-t border-[#CCD2D5] bg-black">
      <Container className="py-8">
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-12">
          <div className="logo">
            <Link to={"/"}>
              <div className="flex items-center">
                <img src="/images/logo.png" alt="" className="h-16" />
                <img src="/images/rcg.png" alt="" className="h-16" />
              </div>
            </Link>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-4">Links</h1>
            <div className="flex gap-8">
              <ul className="text-white space-y-4">
                <li>
                  <Link to="">Register</Link>
                </li>
                <li>
                  <Link to="">Terms and conditions</Link>
                </li>
                <li>
                  <Link to="">Privacy Policy</Link>
                </li>
                {/* <li>
                  <Link to="">Claudantium</Link>
                </li> */}
              </ul>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Follow us on socials
            </h1>
            <div className="flex items-center gap-4 text-white">
              <Link to="">
                <FaFacebookF />
              </Link>
              <Link to="">
                <FaInstagram />
              </Link>
              <Link to="">
                <GrLinkedinOption />
              </Link>
              <Link to="">
                <FaYoutube />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </Box>
  );
};

export default Footer;
