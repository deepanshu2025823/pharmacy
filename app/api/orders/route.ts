import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
// import { requireRole } from "@/app/api/_utils/auth"; // optional (see below)

/* ================= TYPES ================= */

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
  total_amount: number;
  created_at: string;
};

/* ================= GET ORDERS ================= */
/**
 * GET /api/orders?customerId=1
 * Returns all orders of a customer (by phone mapping)
 */
export async function GET(req: NextRequest) {
  try {
    // 🔐 OPTIONAL SECURITY
    // Uncomment if you want only logged-in users / admin
    // await requireRole(["admin", "customer"]);

    const { searchParams } = new URL(req.url);
    const customerIdStr = searchParams.get("customerId");

    if (!customerIdStr) {
      return NextResponse.json(
        { message: "customerId is required" },
        { status: 400 }
      );
    }

    const customerId = Number(customerIdStr);
    if (Number.isNaN(customerId) || customerId <= 0) {
      return NextResponse.json(
        { message: "Invalid customerId" },
        { status: 400 }
      );
    }

    /* ===== Fetch customer ===== */
    const [customerRows]: any = await db.query(
      `
      SELECT id, name, phone
      FROM customers
      WHERE id = ?
      LIMIT 1
      `,
      [customerId]
    );

    if (!customerRows || customerRows.length === 0) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    const customer: CustomerRow = customerRows[0];

    /* ===== Fetch orders using phone ===== */
    const [orderRows]: any = await db.query(
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
    );

    return NextResponse.json({
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
      },
      orders: (orderRows as OrderRow[]) || [],
    });
  } catch (err) {
    console.error("ORDERS LIST ERROR:", err);

    return NextResponse.json(
      { message: "Server error while loading orders" },
      { status: 500 }
    );
  }
}
