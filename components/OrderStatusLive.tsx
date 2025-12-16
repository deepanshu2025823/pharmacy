"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type Props = {
  orderId: number;
  initialStatus: string;
};

let socket: Socket | null = null;

export default function OrderStatusLive({ orderId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    // Socket.IO server initialise करवा दो
    fetch("/api/socketio").catch(() => {});

    // अगर already socket बना हुआ है तो reuse करो
    if (!socket) {
      socket = io({
        path: "/socket.io",
        transports: ["websocket"],
      });
    }

    const s = socket;

    // इस order का room join
    s.emit("join-order", orderId);

    // status updates सुनो
    const handler = (payload: { orderId: number; status: string }) => {
      if (payload.orderId === orderId) {
        setStatus(payload.status);
      }
    };

    s.on("order-status", handler);

    return () => {
      s.off("order-status", handler);
    };
  }, [orderId]);

  const pillClass =
    status === "PAID" || status === "DELIVERED"
      ? "bg-emerald-50 text-emerald-700"
      : status === "CANCELLED"
      ? "bg-red-50 text-red-700"
      : "bg-amber-50 text-amber-700";

  return (
    <div
      className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${pillClass}`}
    >
      {status}
    </div>
  );
}
