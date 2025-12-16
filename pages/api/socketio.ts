// pages/api/socketio.ts
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import type { Socket } from "net";
import { Server as IOServer } from "socket.io";

type SocketWithIO = Socket & {
  server: HTTPServer & {
    io?: IOServer;
  };
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const socket = res.socket as SocketWithIO;

  if (!socket.server.io) {
    console.log("🔌 Initialising Socket.IO server...");

    const io = new IOServer(socket.server, {
      path: "/socket.io",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (client) => {
      console.log("✅ Socket connected:", client.id);

      client.on("join-order", (orderId: number) => {
        if (!orderId) return;
        const room = `order:${orderId}`;
        client.join(room);
        console.log(`👤 joined room ${room}`);
      });

      client.on("disconnect", () => {
        console.log("❌ Socket disconnected:", client.id);
      });
    });

    socket.server.io = io;
  }

  res.end();
}
