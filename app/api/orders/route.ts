import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

type CustomerRow = {
  id: number;
  name: string;
  phone: string;
};

type OrderRow = {
  id: number;
  customer_name: string;
  phone: string;
  payment_method: string;
  payment_status: string;
  total_amount: string | number;
  created_at: string | Date;
};

// GET /api/orders?customerId=1
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get("customerId");

    if (!idStr) {
      return new NextResponse("Missing customerId", { status: 400 });
    }

    const customerId = Number(idStr);
    if (!customerId || Number.isNaN(customerId)) {
      return new NextResponse("Invalid customerId", { status: 400 });
    }

    // Customer ka phone nikal lo
    const [customerRows] = (await db.query(
      `SELECT id, name, phone FROM customers WHERE id = ? LIMIT 1`,
      [customerId]
    )) as any as [CustomerRow[]];

    if (!customerRows || customerRows.length === 0) {
      return new NextResponse("Customer not found", { status: 404 });
    }

    const customer = customerRows[0];

    // Orders table mein hum phone se map kar रहे हैं
    const [orderRows] = (await db.query(
      `
      SELECT
        id,
        customer_name,
        phone,
        payment_method,
        payment_status,
        total_amount,
        created_at
      FROM orders
      WHERE phone = ?
      ORDER BY created_at DESC
    `,
      [customer.phone]
    )) as any as [OrderRow[]];

    return NextResponse.json({ orders: orderRows || [] });
  } catch (err) {
    console.error("ORDERS LIST ERROR:", err);
    return new NextResponse("Server error while loading orders", {
      status: 500,
    });
  }
}
