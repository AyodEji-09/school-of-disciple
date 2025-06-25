import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { handleError } from "../utils";
import axios from "axios";
import { SetAuthToken } from "../data/config";

const Payment = () => {
  const { token } = useParams();
  if (token) {
    SetAuthToken(token);
  }
  console.log({ token });

  const makePayment = async () => {
    try {
      const res = await axios.get<ApiResponseN<{ url: string }>>(
        "/payment/registration-fee"
      );
      window.open(res.data.data?.url);
    } catch (error) {
      console.log({ error });
      toast.error(handleError(error));
    }
  };

  useEffect(() => {
    if (token) {
      makePayment();
    }
  },[token]);
  return <div className="min-h-screen"></div>;
};

export default Payment;
