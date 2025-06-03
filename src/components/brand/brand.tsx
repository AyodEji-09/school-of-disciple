import { Link } from "react-router-dom";

const Brand = ({
  type,
  color,
}: {
  type?: "icon" | "img";
  color?: "light" | "dark";
  height?: string;
}) => {
  return (
    <Link to={"/"}>
      {type === "img" ? (
        color === "light" ? (
          <div className="logo">
            <Link to={"/"}>
              <div className="flex items-center">
                <img src="/images/logo.png" alt="" className="h-16" />
                <img src="/images/rcg.png" alt="" className="h-16" />
              </div>
            </Link>
          </div>
        ) : (
          <div className="logo">
            <Link to={"/"}>
              <div className="flex items-center">
                <img src="/images/logo.png" alt="" className="h-16" />
                <img src="/images/rcg.png" alt="" className="h-16" />
              </div>
            </Link>
          </div>
        )
      ) : (
        <div className="logo">
          <Link to={"/"}>
            <div className="flex items-center">
              <img src="/images/logo.png" alt="" className="h-16" />
              <img src="/images/rcg.png" alt="" className="h-16" />
            </div>
          </Link>
        </div>
      )}
    </Link>
  );
};

export default Brand;
