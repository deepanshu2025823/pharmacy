import { Server } from "socket.io";

let io: Server;

export function initSocket(server: any) {
  if (!io) {
    io = new Server(server, {
      cors: { origin: "*" },
    });
  }
  return io;
}

export function getIO() {
  return io;
}
