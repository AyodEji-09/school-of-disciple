import { useEffect, useRef } from "react";
import { useAppDispatch } from "./hooks";
import { useAppSelector } from "./hooks";
import { selectUser } from "./selectors/authSelector";
import { notificationApi } from "./rtk/notification";
import { connectSocket, disconnectSocket } from "./socket";
import { toast } from "react-toastify";

export const useNotificationSocket = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!user || connectedRef.current) return;

    const socket = connectSocket();
    if (!socket) return;

    connectedRef.current = true;

    const handleNewNotification = (notification: any) => {
      dispatch(notificationApi.util.invalidateTags(["NotificationList"]));

      if (!notification.isRead) {
        const labels: Record<string, string> = {
          transaction_pending: "New pending payment approval",
          transaction_confirmed: "Payment confirmed",
          transaction_rejected: "Payment rejected",
          results_published: "Results published",
          order_placed: "New manual order",
        };
        toast.info(labels[notification.type] || "New notification");
      }
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
      disconnectSocket();
      connectedRef.current = false;
    };
  }, [dispatch, user]);
};
