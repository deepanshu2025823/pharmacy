// components/OrderStatusTracker.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PACKED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

const STATUS_STEPS: { key: OrderStatus; label: string; description?: string }[] =
  [
    { key: "PENDING", label: "Pending", description: "Order placed" },
    { key: "CONFIRMED", label: "Confirmed", description: "Pharmacy confirmed" },
    { key: "PACKED", label: "Packed", description: "Order is packed" },
    {
      key: "OUT_FOR_DELIVERY",
      label: "Out for delivery",
      description: "Rider is on the way",
    },
    { key: "DELIVERED", label: "Delivered", description: "Order delivered" },
  ];

type Props = {
  orderId: number;
  /** initial status from DB (on first load) */
  initialStatus: string;
};

// ---- Socket singleton (client side only) ----
let socket: Socket | null = null;

function getSocket() {
  if (!socket) {
    socket = io("/", {
      path: "/api/socketio",
      transports: ["websocket"],
    });
  }
  return socket;
}

export default function OrderStatusTracker({ orderId, initialStatus }: Props) {
  const [status, setStatus] = useState<OrderStatus>(() => {
    const upper = (initialStatus || "PENDING").toUpperCase() as OrderStatus;
    const valid = STATUS_STEPS.some((s) => s.key === upper);
    return valid ? upper : "PENDING";
  });

  const activeIndex = useMemo(() => {
    const idx = STATUS_STEPS.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  }, [status]);

  useEffect(() => {
    const s = getSocket();

    // room join (match with server code: "join_order")
    s.emit("join_order", { orderId });

    const handleUpdate = (payload: { orderId: number; status: string }) => {
      if (payload.orderId !== orderId) return;

      const upper = payload.status.toUpperCase() as OrderStatus;
      const valid = STATUS_STEPS.some((s) => s.key === upper);
      if (valid) {
        setStatus(upper);
      }
    };

    // event name must match server emit (you already log: Emitted status "X" for order:Y)
    s.on("order_status_update", handleUpdate);

    return () => {
      s.off("order_status_update", handleUpdate);
      // room chhodne ke liye (optional)
      s.emit("leave_order", { orderId });
    };
  }, [orderId]);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 md:p-4 mb-4">
      <h2 className="text-sm font-semibold mb-3">Order tracking</h2>

      {/* Horizontal stepper */}
      <ol className="flex flex-col gap-2 md:flex-row md:items-stretch md:gap-4">
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;

          return (
            <li
              key={step.key}
              className="flex-1 flex items-center md:block md:text-center"
            >
              {/* Dot + line (desktop) */}
              <div className="flex items-center md:flex-col md:gap-1">
                <div
                  className={[
                    "flex items-center justify-center rounded-full border w-6 h-6 md:w-7 md:h-7 text-[11px] md:text-xs font-semibold shrink-0",
                    isCompleted
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : isActive
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "bg-slate-100 border-slate-300 text-slate-400",
                  ].join(" ")}
                >
                  {isCompleted ? "✓" : index + 1}
                </div>

                {/* Line between steps (desktop only) */}
                {index < STATUS_STEPS.length - 1 && (
                  <div className="hidden md:block flex-1 h-px mx-2 bg-slate-200 relative">
                    <div
                      className={[
                        "absolute inset-y-0 left-0 rounded-full",
                        isCompleted
                          ? "bg-emerald-500 w-full"
                          : isActive
                          ? "bg-emerald-300 w-1/2"
                          : "w-0",
                      ].join(" ")}
                    />
                  </div>
                )}

                {/* Text (mobile inline, desktop under dot) */}
                <div className="ml-2 md:ml-0 md:mt-1 text-xs md:text-[11px] text-left md:text-center">
                  <div
                    className={[
                      "font-semibold",
                      isCompleted || isActive
                        ? "text-slate-900"
                        : "text-slate-400",
                    ].join(" ")}
                  >
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="text-[11px] text-slate-400 hidden md:block">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-3 text-[11px] text-slate-500">
        Live status: <span className="font-semibold">{status}</span>
      </p>
    </section>
  );
}
