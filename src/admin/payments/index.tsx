import { Box, Card, Checkbox, Radio, Stack, Typography } from "@mui/joy";
import Frame from "../../components/frame/Frame";
import { MdAddCircle } from "react-icons/md";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import AppPagination from "../../components/pagination/Pagination";
import NoData from "../../components/no-data/NoData";
import AppModal from "../../components/modal/modal";
import { Controller, useForm } from "react-hook-form";
import Input from "../../components/input/input";
import AppButton from "../../components/Button/AppButton";
import { FailedIcon, ProceedIcon, SuccessIcon } from "../../components/icons";
import {
  useGetCardsQuery,
  useGetWalletHistoryQuery,
  useGetWalletQuery,
} from "../../data/store/rtk/settings";
import { GlobalState } from "../../data/Context";
import { useGetTransactionQuery } from "../../data/store/rtk/payout";
import moment from "moment";
import AppTab from "../../components/tab/AppTab";
import axios from "axios";
import { toast } from "react-toastify";
import { getUserFullName, handleError } from "../../utils";
import { useAppSelector } from "../../data/store/hooks";
import { selectUser } from "../../data/store/selectors/userSelector";
import { usePaystackPayment } from "react-paystack";
import AppLoader from "../../components/loader/AppLoader";

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("");
  const { numberWithCommas } = useContext(GlobalState);
  const tabs = [
    { name: "Transaction History", component: <TransactionTable /> },
    { name: "Receipt History", component: <ReceiptHistoryTable /> },
  ];
  const user = useAppSelector(selectUser);

  const toggleModal = (mode?: string) => {
    if (mode) setMode(mode);
    setIsOpen(!isOpen);
  };

  const { data: walletData } = useGetWalletQuery();
  const { data: cardData } = useGetCardsQuery();
  console.log({ walletData, cardData });
  return (
    <Frame text="Wallet">
      <Card variant="outlined">
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Box gap={2}>
            <Typography level="title-sm">Wallet Balance</Typography>
            <Typography level="h4" mt={1}>
              ₦{numberWithCommas(String(walletData?.data.balance ?? 0))}
            </Typography>
          </Box>
          <Box gap={2}>
            <div
              onClick={() => toggleModal("fund wallet")}
              className="cursor-pointer"
            >
              <MdAddCircle size={32} color="#001EC5" className="mx-auto" />
              <button className="underline text-[#001EC5] text-sm mt-1">
                Fund Account
              </button>
            </div>
          </Box>
        </Stack>
      </Card>
      <div className="grid md:grid-cols-3 gap-4 mt-12">
        <div className="md:col-span-2">
          <Typography level="title-md" mb={2}>
            Transactions
          </Typography>
          <Card variant="outlined">
            {user?.type === "company" ? (
              <AppTab tabs={tabs} />
            ) : (
              <TransactionTable />
            )}
          </Card>
        </div>
        <div className="">
          <Stack direction={"row"} justifyContent={"space-between"} mb={2}>
            <Typography level="title-md">Cards</Typography>
            {/* <button
              className="underline text-[#001EC5] text-sm mt-1"
              onClick={() => toggleModal("fund wallet")}
            >
              Add more cards
            </button> */}
          </Stack>
          {cardData?.data.docs.length ? (
            <Card variant="outlined">
              <Stack gap={2}>
                {cardData?.data.docs.map((card) => (
                  <PaymentCard card={card} />
                ))}
              </Stack>
            </Card>
          ) : (
            <></>
          )}
        </div>
      </div>

      <AppModal
        isOpen={isOpen}
        close={toggleModal}
        title={mode === "fund wallet" ? "Fund Wallet" : ""}
      >
        {mode === "fund wallet" && <FundWallet callBack={toggleModal} />}
        {mode === "proceed" && (
          <ActionComponent
            icon={<ProceedIcon />}
            title="Do you want to Proceed?"
            text="You will be charged a N10 confirmation fee that will be funded to your wallet."
            actionOne={{ text: "Continue", action: () => setMode("failed") }}
            actionTwo={{ text: "Back", action: null }}
          />
        )}
        {mode === "failed" && (
          <ActionComponent
            icon={<FailedIcon />}
            title="Transaction Failed"
            text="This transaction is unsuccessfully due to insufficient fund."
            actionOne={{ text: "Okay", action: () => setMode("success") }}
          />
        )}
        {mode === "success" && (
          <ActionComponent
            icon={<SuccessIcon />}
            title="Transaction Successful"
            text="You have success funded your account"
            actionOne={{ text: "Okay", action: toggleModal }}
          />
        )}
        {mode === "card success" && (
          <ActionComponent
            icon={<SuccessIcon />}
            title="Card Successfully Added"
            text="A new card has been added to your account successfuly. Would you like to fund your Artisan Connect wallet? "
            actionOne={{ text: "Yes", action: toggleModal }}
            actionTwo={{ text: "No", action: toggleModal }}
          />
        )}
      </AppModal>
    </Frame>
  );
};

export default Home;

export const FundWallet = ({
  callBack,
}: {
  callBack: (mode?: string) => void;
}) => {
  const user = useAppSelector(selectUser);
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionReference, setTransactionReference] =
    useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("fund wallet");
  const [purpose, setPurpose] = useState("Card");
  const [completePayment, setCompletePayment] = useState(0);
  const { data: cardData } = useGetCardsQuery();
  const [selectedCard, setSelectedCard] = useState<Card | null>();
  const { refetch: refetchWallet } = useGetWalletQuery();
  const { refetch: refetchTransaction } = useGetTransactionQuery({
    limit: "10",
  });

  const config = {
    reference: transactionReference?.reference ?? "",
    email: user?.email ?? "",
    amount: Number(completePayment) * 100, //Amount is in the country's lowest currency. E.g Kobo, so 20000 kobo = N200
    publicKey: process.env.REACT_APP_PAYSTACK_KEY ?? "",
  };

  const initializePayment = usePaystackPayment(config);

  // you can call this function anything
  const onSuccess = (reference: { reference: string }) => {
    // Implementation for whatever you want to do with reference and after success call.
    refetchWallet();
    refetchTransaction();
    console.log(reference);
    if (callBack) {
      callBack("");
    }
  };

  // you can call this function anything
  const onClose = () => {
    // implementation for  whatever you want to do when the Paystack dialog closed.
    console.log("closed");
    if (callBack) {
      callBack("");
    }
  };

  const handleTransaction = async () => {
    console.log({ transactionAmount });
    setLoading(true);
    try {
      const res = await axios.post("/transaction/generate", {
        amount: +transactionAmount,
        purpose: purpose,
      });
      setTransactionReference((res.data as { data: Transaction }).data);
      setMode("choose account");
      console.log({ res });
    } catch (error) {
      console.log({ error });
      toast.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const chargeCard = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/card/charge", {
        amount: Number(completePayment) * 100,
        currency: "NGN",
        card: selectedCard?._id,
        purpose: "Card",
        reference: transactionReference?.reference,
      });
      console.log({ res });
      refetchWallet();
      callBack("");
    } catch (error) {
      console.log({ error });
      toast.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (transactionAmount) {
      let newTotal,
        percent = Math.ceil((1.55272 * Number(transactionAmount)) / 100);

      if (percent > 2000) percent = 2000;
      if (Number(transactionAmount) >= 2500) {
        if (percent === 2000)
          newTotal = Number(transactionAmount) + Number(percent);
        else newTotal = Number(transactionAmount) + Number(percent) + 100;
      } else {
        newTotal = Number(transactionAmount) + Number(percent);
      }
      setCompletePayment(newTotal);
    }
  }, [transactionAmount]);

  return (
    <>
      {mode === "fund wallet" && (
        <Box className="md:min-w-[600px]">
          <Input
            label="How much do you want to fund your wallet with?"
            type="number"
            onChange={(e) => setTransactionAmount(e.target.value)}
          />
          <Stack mt={4}>
            <AppButton
              onClick={() => handleTransaction()}
              loading={loading}
              disabled={loading}
            >
              Continue
            </AppButton>
          </Stack>
        </Box>
      )}
      {mode === "choose account" && (
        <Box className="md:min-w-[600px]">
          <div className="space-y-2">
            {cardData?.data.docs.map((card) => (
              <div className="flex justify-between gap-4 items-center bg-[#F3F5F5] p-4 rounded-md">
                <div className="space-y-3">
                  <p className="text-2xl font-medium">
                    {"*** *** **** " + card?.last_4digits}
                  </p>
                  <p className="text-sm">{card?.issuer}</p>
                </div>
                <Radio
                  size="lg"
                  checked={selectedCard?._id === card._id}
                  onChange={() => setSelectedCard(card)}
                />
              </div>
            ))}
          </div>
          <Stack mt={2}>
            {/* <AppButton
              variant="link"
              className="text-blue-700 w-fit"
              onClick={() => {
                setPurpose("Card");
                handleTransaction();
              }}
            >
              Add more cards
            </AppButton> */}
            <AppButton
              variant="link"
              className="text-blue-700 w-fit"
              onClick={() => initializePayment({ onSuccess, onClose })}
            >
              pay with paystack
            </AppButton>
            <div className="mt-6 px-4">
              <Checkbox
                label="Save card?"
                size="lg"
                checked={purpose === "Card"}
                onChange={() => {
                  purpose === "Card"
                    ? setPurpose("Wallet")
                    : setPurpose("Card");
                }}
              />
            </div>
          </Stack>
          <Stack mt={8}>
            <AppButton
              onClick={chargeCard}
              loading={loading}
              disabled={loading}
            >
              Proceed
            </AppButton>
          </Stack>
        </Box>
      )}
    </>
  );
};

const TransactionTable = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchVar, setSearchVar] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const itemsPerPage = "10";
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: transactionData,
    isLoading,
    isFetching,
  } = useGetTransactionQuery({
    limit: itemsPerPage,
    page: searchParams.get("page")
      ? Number(searchParams.get("page")).toString() ||
        location.search.split("=")[0]
      : "",
    search: searchVar,
  });

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    navigate(`?page=${page}`);
  };
  const [currentItems, setCurrentItems] = useState<Transaction[] | undefined>();

  const totalPages = transactionData
    ? Math.ceil(transactionData.data.totalPages)
    : 0;

  useEffect(() => {
    if (!location.search) {
      setSearchParams({ page: "1" });
      return;
    }
  }, []);

  useLayoutEffect(() => {
    setCurrentItems(transactionData?.data.docs);
  }, [isLoading, isFetching, location, searchVar, location.search]);
  return (
    <div>
      <Box
        minHeight={400}
        position={"relative"}
        className={"overflow-x-auto scrollbar-hide"}
      >
        <table className="w-full text-sm text-left rtl:text-right text-[#001F54]">
          <thead className="text-xs whitespace-nowrap">
            <tr>
              <th scope="col" className="px-6 py-3">
                Date
              </th>
              <th scope="col" className="px-6 py-3">
                Transaction Ref
              </th>
              <th scope="col" className="px-6 py-3">
                Transaction Title
              </th>
              <th scope="col" className="px-6 py-3">
                Transaction Type
              </th>
              <th scope="col" className="px-6 py-3">
                Amount
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              <tr className="py-8 my-8">
                <td colSpan={6} className="py-8 text-center">
                  <AppLoader />
                </td>
              </tr>
            ) : totalPages ? (
              currentItems?.map((transaction: Transaction, idx) => (
                <tr className="border-b font-medium" key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {moment(transaction?.createdAt).format("DD MMM YYYY")}
                  </td>
                  <td className="px-6 py-4">{transaction?.reference}</td>
                  <td className="px-6 py-4">{transaction?.message}</td>
                  <td className="px-6 py-4">{transaction?.type}</td>
                  <td className="px-6 py-4">{transaction?.amount}</td>
                  <td className="px-6 py-4">{transaction?.status}</td>
                </tr>
              ))
            ) : (
              <tr className="py-8 my-8">
                <td colSpan={8} className="py-8">
                  <NoData />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex overflow-x-auto sm:justify-end py-2 px-6 gap-2 items-center">
          <AppPagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
          <span className="text-xs font-medium">of {totalPages}</span>
        </div>
      </Box>
    </div>
  );
};

const ReceiptHistoryTable = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchVar, setSearchVar] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const itemsPerPage = "10";
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: transactionData,
    isLoading,
    refetch,
    isFetching,
  } = useGetWalletHistoryQuery({
    limit: itemsPerPage,
    page: searchParams.get("page")
      ? Number(searchParams.get("page")).toString() ||
        location.search.split("=")[0]
      : "",
    search: searchVar,
  });

  console.log({ transactionData });

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    navigate(`?page=${page}`);
  };
  const [currentItems, setCurrentItems] = useState<
    WalletHistory[] | undefined
  >();

  const totalPages = transactionData
    ? Math.ceil(transactionData.data.totalPages)
    : 0;

  useEffect(() => {
    if (!location.search) {
      setSearchParams({ page: "1" });
      return;
    }
  }, []);

  useLayoutEffect(() => {
    setCurrentItems(transactionData?.data.docs);
  }, [isLoading, isFetching, location, searchVar, location.search]);
  return (
    <div>
      <Box
        minHeight={400}
        position={"relative"}
        className={"overflow-x-auto scrollbar-hide"}
      >
        <table className="w-full text-sm text-left rtl:text-right text-[#001F54]">
          <thead className="text-xs whitespace-nowrap">
            <tr>
              <th scope="col" className="px-6 py-3">
                Date
              </th>
              <th scope="col" className="px-6 py-3">
                Artisan Name
              </th>
              <th scope="col" className="px-6 py-3">
                Category
              </th>
              <th scope="col" className="px-6 py-3">
                Transaction Id
              </th>
              <th scope="col" className="px-6 py-3">
                Resident Address
              </th>
              <th scope="col" className="px-6 py-3">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              <tr className="py-8 my-8">
                <td colSpan={6} className="py-8 text-center">
                  <AppLoader />
                </td>
              </tr>
            ) : totalPages ? (
              currentItems &&
              currentItems?.map((wallet: WalletHistory, idx) => (
                <tr className="border-b font-medium" key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {moment(wallet?.createdAt).format("DD MMM YYYY")}
                  </td>
                  {/* <td className="px-6 py-4">
                    {moment(transaction?.createdAt).format("DD MMM YYYY")}
                  </td> */}
                  <td className="px-6 py-4">
                    {getUserFullName(wallet?.owner)}
                  </td>
                  <td className="px-6 py-4">{wallet?.owner?.category?.name}</td>
                  <td className="px-6 py-4">{wallet?._id}</td>
                  <td className="px-6 py-4">{wallet?.owner?.address}</td>
                  <td className="px-6 py-4">{wallet?.amount}</td>
                </tr>
              ))
            ) : (
              <tr className="py-8 my-8">
                <td colSpan={8} className="py-8">
                  <NoData />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex overflow-x-auto sm:justify-end py-2 px-6 gap-2 items-center">
          <AppPagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
          <span className="text-xs font-medium">of {totalPages}</span>
        </div>
      </Box>
    </div>
  );
};

const PaymentCard = ({ card }: { card: Card }) => {
  return (
    <Card variant="outlined" sx={{ boxShadow: "2px 2px 10px 2px #1F001B26" }}>
      <Stack gap={2}>
        <Stack>
          <Typography level="title-sm">{card?.issuer}</Typography>
          <Typography level="h4">
            {"*** *** *** " + card?.last_4digits}
          </Typography>
        </Stack>
        <Typography level="title-sm">
          {getUserFullName(card?.createdBy)}
        </Typography>
      </Stack>
    </Card>
  );
};

const ActionComponent = ({
  icon,
  title,
  text,
  actionOne,
  actionTwo,
}: {
  icon: JSX.Element;
  title: string;
  text: string;
  actionOne: ModalButton;
  actionTwo?: ModalButton;
}) => {
  return (
    <Stack maxWidth={300} gap={2}>
      <Stack alignItems={"center"}>{icon}</Stack>
      <Typography textAlign={"center"} level="h4">
        {title}
      </Typography>
      <Typography textAlign={"center"} level="body-md">
        {text}
      </Typography>
      <Stack mt={4}>
        <AppButton onClick={actionOne.action}>{actionOne.text}</AppButton>
        {actionTwo && (
          <AppButton variant="plain" onClick={actionTwo.action}>
            {actionTwo.text}
          </AppButton>
        )}
      </Stack>
    </Stack>
  );
};
