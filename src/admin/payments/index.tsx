import { useState } from "react";
import Frame from "../../components/frame/Frame";
import { Box, Card } from "@mui/joy";
import AppModal from "../../components/modal/modal";
import { useGetPaymentsQuery } from "../../data/rtk/payment";
import moment from "moment";
import { useSelector } from "react-redux";
import { selectUser } from "../../data/selectors/authSelector";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/Button/AppButton";
import axios from "axios";
import { toast } from "react-toastify";
import { handleError } from "../../utils";
import { openFinancialReportPrintPreview } from "./report-template";
import {
  CenteredEmptyState,
  TableSkeleton,
} from "../../components/query-state/QueryStates";

type CenterBreakdown = {
  centerName: string;
  transactions: number;
  amount: number;
};

type FinancialReport = {
  scopeLabel: string;
  generatedAt: string;
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  totalAmount: number;
  averageAmount: number;
  dateFrom?: string;
  dateTo?: string;
  centerBreakdown: CenterBreakdown[];
};

const formatCurrency = (kobo: number) => {
  return `$${(kobo / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const isSuccessfulPayment = (status?: string) => {
  const value = (status || "").toLowerCase();
  return ["paid", "success", "successful", "succeeded", "completed"].includes(
    value,
  );
};

const isFailedPayment = (status?: string) => {
  const value = (status || "").toLowerCase();
  return ["failed", "cancelled", "canceled", "error"].includes(value);
};

const getStudentFromPayment = (payment: Payment) => {
  if (!payment.studentId || typeof payment.studentId === "string") {
    return null;
  }

  return payment.studentId as User & { id?: string };
};

const getPayerId = (payment: Payment) => {
  if (typeof payment.studentId === "string") return payment.studentId;

  const student = payment.studentId as User & { id?: string };
  return student?._id || student?.id;
};

const getCenterNameFromPayment = (payment: Payment) => {
  const student = getStudentFromPayment(payment);

  if (!student || !student.center) return "-";
  if (typeof student.center === "string") return "-";

  return student.center.name || "-";
};

const Payments = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Frame text="Payments">
      {/* <Card variant="outlined">
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Box gap={2}>
            <Typography level="title-sm">Wallet Balance</Typography>
            <Typography level="h4" mt={1}>
              $1000
            </Typography>
          </Box>
          <Box gap={2}>
            <div onClick={() => toggleModal()} className="cursor-pointer">
              <MdAddCircle size={32} color="#001EC5" className="mx-auto" />
              <button className="underline text-[#001EC5] text-sm mt-1">
                Fund Account
              </button>
            </div>
          </Box>
        </Stack>
      </Card> */}
      <div className="mt-12">
        <div className="">
          <Card variant="outlined">
            <TransactionTable />
          </Card>
        </div>
      </div>

      <AppModal isOpen={isOpen} close={toggleModal}>
        <div></div>
      </AppModal>
    </Frame>
  );
};

export default Payments;

const TransactionTable = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isCoordinator = user?.type === "coordinator";
  const coordinatorCenterId =
    typeof user?.center === "string" ? user.center : user?.center?._id;
  const coordinatorCenterName =
    user?.center && typeof user.center !== "string"
      ? user.center.name
      : undefined;
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { data: payments, isLoading } = useGetPaymentsQuery(
    {
      limit: 20,
      ...(isCoordinator && coordinatorCenterId
        ? { center: coordinatorCenterId }
        : {}),
    },
    { skip: isCoordinator && !coordinatorCenterId },
  );
  console.log({ payments });
  const hasPayments = Boolean(payments?.data?.docs?.length);

  const generateFinancialReport = async () => {
    if (isCoordinator && !coordinatorCenterId) {
      toast.error("Coordinator center not found. Please contact admin.");
      return;
    }

    setIsGeneratingReport(true);
    try {
      const fetchedPayments: Payment[] = [];
      let page = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "100");

        if (isCoordinator && coordinatorCenterId) {
          params.set("center", coordinatorCenterId);
        }

        const res = await axios.get<ApiResponse<Payment>>(
          `/payment?${params.toString()}`,
        );

        const docs = res?.data?.data?.docs || [];
        fetchedPayments.push(...docs);

        hasNextPage = Boolean(res?.data?.data?.hasNextPage);
        page += 1;
      }

      const totalTransactions = fetchedPayments.length;
      const successfulTransactions = fetchedPayments.filter((payment) =>
        isSuccessfulPayment(payment.status),
      ).length;
      const failedTransactions = fetchedPayments.filter((payment) =>
        isFailedPayment(payment.status),
      ).length;
      const pendingTransactions =
        totalTransactions - successfulTransactions - failedTransactions;
      const totalAmount = fetchedPayments.reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0,
      );
      const averageAmount = totalTransactions
        ? Math.round(totalAmount / totalTransactions)
        : 0;

      const timestamps = fetchedPayments
        .map((payment) => new Date(payment.createdAt).getTime())
        .filter((value) => Number.isFinite(value));

      const minTime = timestamps.length ? Math.min(...timestamps) : undefined;
      const maxTime = timestamps.length ? Math.max(...timestamps) : undefined;

      const centerMap = new Map<
        string,
        { transactions: number; amount: number }
      >();

      fetchedPayments.forEach((payment) => {
        const centerName = isCoordinator
          ? coordinatorCenterName || "Coordinator Center"
          : getCenterNameFromPayment(payment);
        const prev = centerMap.get(centerName) || {
          transactions: 0,
          amount: 0,
        };
        centerMap.set(centerName, {
          transactions: prev.transactions + 1,
          amount: prev.amount + (payment.amount || 0),
        });
      });

      const centerBreakdown: CenterBreakdown[] = Array.from(centerMap.entries())
        .map(([centerName, stats]) => ({
          centerName,
          transactions: stats.transactions,
          amount: stats.amount,
        }))
        .sort((a, b) => b.amount - a.amount);

      const report: FinancialReport = {
        scopeLabel: isCoordinator
          ? `${coordinatorCenterName || "My Center"} (Coordinator)`
          : "All Centers (Admin)",
        generatedAt: moment().format("MM/DD/YYYY, HH:mm"),
        totalTransactions,
        successfulTransactions,
        pendingTransactions,
        failedTransactions,
        totalAmount,
        averageAmount,
        dateFrom: minTime ? moment(minTime).format("MM/DD/YYYY") : undefined,
        dateTo: maxTime ? moment(maxTime).format("MM/DD/YYYY") : undefined,
        centerBreakdown,
      };

      const didOpenPreview = openFinancialReportPrintPreview({
        report: {
          scopeLabel: report.scopeLabel,
          generatedAt: report.generatedAt,
          totalTransactions: report.totalTransactions,
          successfulTransactions: report.successfulTransactions,
          pendingTransactions: report.pendingTransactions,
          failedTransactions: report.failedTransactions,
          totalAmountFormatted: formatCurrency(report.totalAmount),
          averageAmountFormatted: formatCurrency(report.averageAmount),
          dateFrom: report.dateFrom,
          dateTo: report.dateTo,
          centerBreakdown: report.centerBreakdown.map((center) => ({
            centerName: center.centerName,
            transactions: center.transactions,
            amountFormatted: formatCurrency(center.amount),
          })),
        },
        transactions: fetchedPayments.map((payment) => ({
          date: moment(payment.createdAt).format("MM/DD/YYYY"),
          transactionRef: payment._id,
          description: payment.description || "Registration Fee",
          center: getCenterNameFromPayment(payment),
          status: payment.status,
          amountFormatted: formatCurrency(payment.amount),
        })),
      });

      if (!didOpenPreview) {
        toast.error("Unable to open report preview. Please allow popups.");
        return;
      }

      toast.success("Financial report generated.");
    } catch (error) {
      toast.error(handleError(error));
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AppButton
          type="button"
          loading={isGeneratingReport}
          disabled={isGeneratingReport}
          onClick={generateFinancialReport}
        >
          {isCoordinator
            ? "Generate Center Financial Report"
            : "Generate All Centers Financial Report"}
        </AppButton>
      </div>

      <Box
        minHeight={400}
        position={"relative"}
        className={"overflow-x-auto scrollbar-hide w-full"}
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
                Description
              </th>
              {!isCoordinator && (
                <th scope="col" className="px-6 py-3">
                  Center
                </th>
              )}
              <th scope="col" className="px-6 py-3">
                Amount
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="whitespace-nowrap">
            {isLoading && !hasPayments ? (
              <tr>
                <td colSpan={isCoordinator ? 6 : 7}>
                  <div className="px-4 py-4">
                    <TableSkeleton columns={isCoordinator ? 6 : 7} rows={6} />
                  </div>
                </td>
              </tr>
            ) : hasPayments ? (
              payments?.data.docs.map((payment) => {
                const payerId = getPayerId(payment);

                return (
                  <tr
                    className="border-b last:border-none font-medium"
                    key={payment._id}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {moment(payment?.createdAt).format("MM/DD/YYYY")}
                    </td>
                    <td className="px-6 py-4">{payment?._id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment?.description || "Registration Fee"}
                    </td>
                    {!isCoordinator && (
                      <td className="px-6 py-4">
                        {getCenterNameFromPayment(payment)}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      ${(payment.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">{payment?.status}</td>
                    <td className="px-6 py-4">
                      <AppButton
                        type="button"
                        disabled={!payerId}
                        onClick={() => navigate(`/payments/users/${payerId}`)}
                      >
                        Payer
                      </AppButton>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={isCoordinator ? 6 : 7}>
                  <CenteredEmptyState description="No payments yet" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Box>
    </div>
  );
};

// const ReceiptHistoryTable = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [searchVar, setSearchVar] = useState("");
//   const [searchParams, setSearchParams] = useSearchParams();

//   const itemsPerPage = "10";
//   const [currentPage, setCurrentPage] = useState(1);
//   const {
//     data: transactionData,
//     isLoading,
//     refetch,
//     isFetching,
//   } = useGetWalletHistoryQuery({
//     limit: itemsPerPage,
//     page: searchParams.get("page")
//       ? Number(searchParams.get("page")).toString() ||
//         location.search.split("=")[0]
//       : "",
//     search: searchVar,
//   });

//   console.log({ transactionData });

//   const onPageChange = (page: number) => {
//     setCurrentPage(page);
//     navigate(`?page=${page}`);
//   };
//   const [currentItems, setCurrentItems] = useState<
//     WalletHistory[] | undefined
//   >();

//   const totalPages = transactionData
//     ? Math.ceil(transactionData.data.totalPages)
//     : 0;

//   useEffect(() => {
//     if (!location.search) {
//       setSearchParams({ page: "1" });
//       return;
//     }
//   }, []);

//   useLayoutEffect(() => {
//     setCurrentItems(transactionData?.data.docs);
//   }, [isLoading, isFetching, location, searchVar, location.search]);
//   return (
//     <div>
//       <Box
//         minHeight={400}
//         position={"relative"}
//         className={"overflow-x-auto scrollbar-hide"}
//       >
//         <table className="w-full text-sm text-left rtl:text-right text-[#001F54]">
//           <thead className="text-xs whitespace-nowrap">
//             <tr>
//               <th scope="col" className="px-6 py-3">
//                 Date
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 Artisan Name
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 Category
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 Transaction Id
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 Resident Address
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 Amount
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {isFetching ? (
//               <tr className="py-8 my-8">
//                 <td colSpan={6} className="py-8 text-center">
//                   <AppLoader />
//                 </td>
//               </tr>
//             ) : totalPages ? (
//               currentItems &&
//               currentItems?.map((wallet: WalletHistory, idx) => (
//                 <tr className="border-b font-medium" key={idx}>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {moment(wallet?.createdAt).format("DD MMM YYYY")}
//                   </td>
//                   <td className="px-6 py-4">
//                     {getUserFullName(wallet?.owner)}
//                   </td>
//                   <td className="px-6 py-4">{wallet?.owner?.category?.name}</td>
//                   <td className="px-6 py-4">{wallet?._id}</td>
//                   <td className="px-6 py-4">{wallet?.owner?.address}</td>
//                   <td className="px-6 py-4">{wallet?.amount}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr className="py-8 my-8">
//                 <td colSpan={8} className="py-8">
//                   <NoData />
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//         <div className="flex overflow-x-auto sm:justify-end py-2 px-6 gap-2 items-center">
//           <AppPagination
//             totalPages={totalPages}
//             currentPage={currentPage}
//             onPageChange={onPageChange}
//           />
//           <span className="text-xs font-medium">of {totalPages}</span>
//         </div>
//       </Box>
//     </div>
//   );
// };
