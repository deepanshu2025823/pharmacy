// app/orders/[id]/page.tsx
import Header from "@/components/Header";
import db from "@/lib/db";
import { notFound } from "next/navigation";
import OrderStatusTracker from "@/components/OrderStatusTracker";

type OrderRow = {
  id: number;
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  state: string | null;
  pincode: string;
  payment_method: string;
  payment_status: string;
  status?: string; // made optional because some DBs may not have this column
  subtotal: string | number;
  delivery_fee: string | number;
  discount: string | number;
  total_amount: string | number;
  created_at: string | Date;
};

type ItemRow = {
  id: number;
  product_name: string;
  qty: number;
  price: string | number;
  line_total: string | number;
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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (!orderId || Number.isNaN(orderId)) {
    notFound();
  }

  // ---------- Load order ----------
  // Try the query that selects `status`. If the column doesn't exist, fall back to a query without it.
  let orderRows: OrderRow[] | undefined = undefined;
  try {
    const result = (await db.query(
      `
      SELECT
        id,
        customer_name,
        phone,
        address,
        city,
        state,
        pincode,
        payment_method,
        payment_status,
        status,
        subtotal,
        delivery_fee,
        discount,
        total_amount,
        created_at
      FROM orders
      WHERE id = ?
      LIMIT 1
    `,
      [orderId]
    )) as any;
    // mysql2 returns [rows, fields] — take first element
    orderRows = result[0] as OrderRow[];
  } catch (err: any) {
    // If it's a "unknown column" error for 'status', try again without status
    const msg = String(err?.message || err?.sqlMessage || "");
    if (msg.toLowerCase().includes("unknown column") && msg.includes("status")) {
      try {
        const result2 = (await db.query(
          `
        SELECT
          id,
          customer_name,
          phone,
          address,
          city,
          state,
          pincode,
          payment_method,
          payment_status,
          subtotal,
          delivery_fee,
          discount,
          total_amount,
          created_at
        FROM orders
        WHERE id = ?
        LIMIT 1
        `,
          [orderId]
        )) as any;
        orderRows = result2[0] as OrderRow[];
        // ensure status exists on the object (fallback)
        if (orderRows && orderRows.length > 0) {
          (orderRows[0] as any).status = "PENDING";
        }
      } catch (err2) {
        console.error("Failed fallback order query:", err2);
        throw err2;
      }
    } else {
      // rethrow unknown errors so dev sees real issue
      console.error("Order load error:", err);
      throw err;
    }
  }

  if (!orderRows || orderRows.length === 0) {
    notFound();
  }

  const order = orderRows[0];

  // ---------- Load items ----------
  const [itemRows] = (await db.query(
    `
      SELECT
        oi.id,
        m.product_name,
        oi.qty,
        oi.price,
        (oi.qty * oi.price) AS line_total
      FROM order_items oi
      JOIN medicines m ON oi.medicine_id = m.id
      WHERE oi.order_id = ?
    `,
    [orderId]
  )) as any as [ItemRow[]];

  const items = itemRows || [];

  const subtotalFromDb = Number(order.subtotal ?? 0);
  const calculatedSubtotal =
    items.length > 0
      ? items.reduce((sum, item) => sum + Number(item.line_total ?? 0), 0)
      : 0;

  const subtotal = subtotalFromDb > 0 ? subtotalFromDb : calculatedSubtotal;

  const deliveryFee = Number(order.delivery_fee ?? 0);
  const discount = Number(order.discount ?? 0);
  const totalAmount =
    Number(order.total_amount ?? 0) || subtotal + deliveryFee - discount;

  const logicalStatus = (order.status || "PENDING").toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-3 md:px-4 py-6 md:py-8 space-y-4">
          {/* Top heading */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Order #{order.id}</h1>
              <p className="text-xs md:text-sm text-slate-600">Placed on {formatDate(order.created_at)}</p>
            </div>

            <div className="text-right text-xs md:text-sm">
              <div className="font-semibold">Payment: {order.payment_method.toUpperCase()}</div>
              <div
                className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  logicalStatus === "DELIVERED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}
              >
                {logicalStatus}
              </div>
            </div>
          </div>

          {/* --- NEW: flow diagram / tracker --- */}
          <OrderStatusTracker orderId={order.id} initialStatus={logicalStatus} />

          {/* Customer card */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5">
            <h2 className="text-sm font-semibold mb-2">Customer</h2>
            <div className="text-xs md:text-sm text-slate-700 space-y-0.5">
              <div className="font-medium">{order.customer_name}</div>
              <div>{order.phone}</div>
            </div>
          </section>

          {/* Address + summary */}
          <div className="grid md:grid-cols-[2.2fr,1.4fr] gap-4 md:gap-5">
            {/* Address */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5">
              <h2 className="text-sm font-semibold mb-2">Delivery address</h2>
              <div className="text-xs md:text-sm text-slate-700 space-y-0.5">
                <div>{order.address}</div>
                <div>
                  {order.city}
                  {order.state ? `, ${order.state}` : ""} – {order.pincode}
                </div>
              </div>
            </section>

            {/* Summary */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5">
              <h2 className="text-sm font-semibold mb-3">Order summary</h2>

              <dl className="text-xs md:text-sm space-y-1">
                <div className="flex justify-between">
                  <dt className="text-slate-600">Subtotal</dt>
                  <dd className="font-medium">{formatMoney(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">Delivery charges</dt>
                  <dd className="font-medium">{deliveryFee > 0 ? formatMoney(deliveryFee) : "₹0.00"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">Discount</dt>
                  <dd className="font-medium text-emerald-700">-{formatMoney(discount)}</dd>
                </div>

                <div className="border-t border-slate-200 my-2 pt-2 flex justify-between text-sm md:text-base font-semibold">
                  <dt>Total amount</dt>
                  <dd>{formatMoney(totalAmount)}</dd>
                </div>
              </dl>

              <p className="mt-2 text-[11px] md:text-xs text-slate-500">This is a system-generated invoice for your order. For any queries, please contact customer support.</p>
            </section>
          </div>

          {/* Items */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5">
            <h2 className="text-sm font-semibold mb-3">Items</h2>

            {items.length === 0 ? (
              <p className="text-xs md:text-sm text-slate-500">No items found for this order.</p>
            ) : (
              <div className="overflow-x-auto -mx-2 md:mx-0">
                <table className="min-w-full text-xs md:text-sm border-separate border-spacing-y-1">
                  <thead>
                    <tr className="text-left text-[11px] uppercase text-slate-500">
                      <th className="px-2 md:px-3 py-1">Product</th>
                      <th className="px-2 md:px-3 py-1 text-center">Qty</th>
                      <th className="px-2 md:px-3 py-1 text-right">Price</th>
                      <th className="px-2 md:px-3 py-1 text-right">Line total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="bg-slate-50/60 hover:bg-slate-100">
                        <td className="px-2 md:px-3 py-2 rounded-l-xl">
                          <div className="font-medium">{item.product_name}</div>
                        </td>
                        <td className="px-2 md:px-3 py-2 text-center">{item.qty}</td>
                        <td className="px-2 md:px-3 py-2 text-right">{formatMoney(Number(item.price))}</td>
                        <td className="px-2 md:px-3 py-2 text-right rounded-r-xl">{formatMoney(Number(item.line_total))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
