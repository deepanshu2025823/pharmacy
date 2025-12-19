import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(
      "https://pharmacy-socket-server-production.up.railway.app",
      {
        transports: ["websocket"],
      }
    );
  }
  return socket;
};
