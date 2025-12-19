import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Admin connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Admin disconnected:", socket.id);
  });
});

export function emitAdminNotification(data: {
  message: string;
  link: string;
}) {
  io.emit("admin:notification", data);
}

export function emitDashboardUpdate() {
  io.emit("dashboard:update");
  io.emit("order:new");
}

httpServer.listen(3001, () => {
  console.log("Socket.IO running on http://localhost:3001");
});
