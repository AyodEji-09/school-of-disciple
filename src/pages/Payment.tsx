import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { handleError } from "../utils";
import axios from "axios";
import { SetAuthToken } from "../data/config";

const Payment = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const hasInitiatedPayment = useRef(false);

  useEffect(() => {
    if (!token || hasInitiatedPayment.current) return;

    hasInitiatedPayment.current = true;
    SetAuthToken(token);

    const makePayment = async () => {
      try {
        const res = await axios.get<ApiResponseN<{ url: string }>>(
          "/payment/registration-fee",
        );
        const url = res.data.data?.url;
        if (url) {
          window.open(url, "_blank");
        }
      } catch (error: any) {
        console.log({ error });
        const status = error?.response?.status;

        // If user already paid (400 error), redirect to dashboard
        if (status === 400) {
          toast.info("Payment already completed. Redirecting to dashboard...");
          setTimeout(() => {
            navigate("/my-dashboard");
          }, 1500);
        } else {
          toast.error(handleError(error));
          // Redirect to dashboard on other errors too
          setTimeout(() => {
            navigate("/my-dashboard");
          }, 2000);
        }
      }
    };

    makePayment();
  }, [token, navigate]);

  return <div className="min-h-screen"></div>;
};

export default Payment;
