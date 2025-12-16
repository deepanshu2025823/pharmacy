// pages/api/order-status.ts
import type { NextApiRequest, NextApiResponse } from "next";
import type { Socket } from "net";
import type { Server as HTTPServer } from "http";
import { Server as IOServer } from "socket.io";
import db from "@/lib/db";

type SocketWithIO = Socket & {
  server: HTTPServer & {
    io?: IOServer;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method not allowed");
  }

  try {
    const { orderId, status } = req.body as {
      orderId?: number;
      status?: string;
    };

    if (!orderId || !status) {
      return res.status(400).send("orderId and status are required");
    }

    await db.query(
      `UPDATE orders SET payment_status = ? WHERE id = ?`,
      [status, orderId]
    );

    const socket = res.socket as SocketWithIO;
    const io = socket.server.io;

    if (io) {
      const room = `order:${orderId}`;
      io.to(room).emit("order-status", { orderId, status });
      console.log(`📣 Emitted status "${status}" for ${room}`);
    } else {
      console.warn("Socket.IO server not initialised yet");
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("ORDER-STATUS API ERROR:", err);
    return res
      .status(500)
      .send("Server error while updating order status");
  }
}
