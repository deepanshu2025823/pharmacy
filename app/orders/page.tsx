"use client";

import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const USER_KEY = "pharmacy_user";

type StoredUser = {
  id?: number;
  name?: string;
};

type OrderListRow = {
  id: number;
  customer_name: string;
  phone: string;
  payment_method: string;
  payment_status: string;
  total_amount: string | number;
  created_at: string | Date;
};

function formatMoney(value: number) {
  return `₹${value.toFixed(2)}`;
}

function formatDate(value: string | Date) {
  const d = new Date(value);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function OrdersPage() {
  const router = useRouter();

  const [user, setUser] = useState<StoredUser | null>(null);
  const [orders, setOrders] = useState<OrderListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) {
      router.push("/login?next=/orders");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as StoredUser;
      if (!parsed.id) {
        router.push("/login?next=/orders");
        return;
      }
      setUser(parsed);
      loadOrders(parsed.id);
    } catch {
      router.push("/login?next=/orders");
    }
  }, [router]);

  const loadOrders = async (customerId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders?customerId=${customerId}`);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to load orders");
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-3 md:px-4 py-6 md:py-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                My orders / invoices
              </h1>
              {user && (
                <p className="text-xs md:text-sm text-slate-600">
                  Showing orders for {user.name}
                </p>
              )}
            </div>
          </div>

          {loading && (
            <p className="text-sm text-slate-500">Loading your orders…</p>
          )}

          {!loading && error && (
            <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-xs md:text-sm">
              {error}
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 text-center space-y-2">
              <p className="text-sm text-slate-600">
                You have not placed any orders yet.
              </p>
              <button
                onClick={() => router.push("/")}
                className="inline-flex px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
              >
                Start shopping
              </button>
            </div>
          )}

          {orders.length > 0 && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5">
              <div className="overflow-x-auto -mx-2 md:mx-0">
                <table className="min-w-full text-xs md:text-sm border-separate border-spacing-y-1">
                  <thead>
                    <tr className="text-left text-[11px] uppercase text-slate-500">
                      <th className="px-2 md:px-3 py-1">Order</th>
                      <th className="px-2 md:px-3 py-1">Placed on</th>
                      <th className="px-2 md:px-3 py-1">Payment</th>
                      <th className="px-2 md:px-3 py-1 text-right">
                        Total amount
                      </th>
                      <th className="px-2 md:px-3 py-1 text-right">
                        Invoice
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="bg-slate-50/60 hover:bg-slate-100"
                      >
                        <td className="px-2 md:px-3 py-2 rounded-l-xl">
                          <div className="font-medium">
                            Order #{order.id}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {order.customer_name}
                          </div>
                        </td>
                        <td className="px-2 md:px-3 py-2">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-2 md:px-3 py-2">
                          <div className="text-xs">
                            {order.payment_method.toUpperCase()}
                          </div>
                          <div
                            className={`mt-1 inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              order.payment_status === "PAID"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {order.payment_status}
                          </div>
                        </td>
                        <td className="px-2 md:px-3 py-2 text-right">
                          {formatMoney(Number(order.total_amount))}
                        </td>
                        <td className="px-2 md:px-3 py-2 text-right rounded-r-xl">
                          <button
                            onClick={() =>
                              router.push(`/orders/${order.id}`)
                            }
                            className="inline-flex px-3 py-1.5 rounded-full border border-emerald-500 text-emerald-600 text-[11px] font-medium hover:bg-emerald-50"
                          >
                            View invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
