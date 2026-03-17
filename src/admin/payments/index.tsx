import { useState } from "react";
import Frame from "../../components/frame/Frame";
import { Box, Card, Typography } from "@mui/joy";
import AppModal from "../../components/modal/modal";
import { useGetPaymentsQuery } from "../../data/rtk/payment";
import { PulseLoader } from "react-spinners";
import { Empty } from "antd";
import moment from "moment";
import { useSelector } from "react-redux";
import { selectUser } from "../../data/selectors/authSelector";

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
              ₦1000
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
          <Typography level="title-md" mb={2}>
            Transactions
          </Typography>
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
  const user = useSelector(selectUser);
  const {
    data: payments,
    isLoading,
    isFetching,
  } = useGetPaymentsQuery({ limit: 20, center: user?.center?._id ?? "" });
  console.log({ payments });
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
                Amount
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading || isFetching ? (
              <td colSpan={7}>
                <div className="flex min-h-96 items-center justify-center">
                  <PulseLoader className="mx-auto" size="large" />
                </div>
              </td>
            ) : payments?.data?.docs?.length ? (
              payments?.data.docs.map((payment) => (
                <tr className="border-b last:border-none font-medium">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {moment(payment?.createdAt).format("DDD MMM YYYY")}
                  </td>
                  <td className="px-6 py-4">{payment?._id}</td>
                  <td className="px-6 py-4">
                    ${(payment.amount / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">{payment?.status}</td>
                </tr>
              ))
            ) : (
              <td colSpan={7}>
                <div className="flex min-h-96 items-center justify-center">
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              </td>
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
