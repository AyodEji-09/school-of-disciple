import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { handleError } from "../utils";
import axios from "axios";
import { SetAuthToken } from "../data/config";
import { hasCompletedIntake } from "../utils/intake";
import { PulseLoader } from "react-spinners";

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
        // Ensure user has completed the intake form before allowing payment
        const me = await axios.get<ApiResponseN<User>>("/user");
        const currentUser = me.data.data;
        const completed = hasCompletedIntake(currentUser);
        if (!completed) {
          toast.info(
            "Please complete the registration form before making payment.",
          );
          setTimeout(() => {
            navigate("/onboarding/1");
          }, 800);
          return;
        }

        const res = await axios.get<ApiResponseN<{ url: string }>>(
          "/payment/registration-fee",
        );
        const url = res.data.data?.url;
        if (url) {
          window.location.href = url;
        }
      } catch (error: any) {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5FAFF]">
      <PulseLoader size={12} color="#001EC5" />
      <p className="mt-4 text-[#001F54] text-sm font-medium">
        Redirecting to payment...
      </p>
    </div>
  );
};

export default Payment;
