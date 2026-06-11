import { io, Socket } from "socket.io-client";
import { TOKEN, useURL } from "./config";

let socket: Socket | null = null;

const getSocketUrl = () => {
  const url = useURL.replace(/\/api\/v1\/?$/, "");
  return url || "http://localhost:1800";
};

export const connectSocket = () => {
  if (socket?.connected) return socket;

  const token = localStorage.getItem(TOKEN);
  if (!token) return null;

  socket = io(getSocketUrl(), {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on("connect_error", (err) => {
    console.warn("Socket connection error:", err.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
