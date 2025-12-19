import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRole } from "@/app/api/_utils/auth";

export async function GET() {
  try {
    await requireRole(["admin", "staff"]);

    const [rows]: any = await db.query(`
      SELECT 
        o.id,
        o.customer_id,
        c.name as customer_name,
        c.phone,
        o.address,
        o.city,
        o.state,
        o.pincode,
        o.payment_method,
        o.payment_status,
        o.subtotal,
        o.delivery_fee,
        o.discount,
        o.total_amount,
        o.status,
        o.created_at
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.id DESC
    `);

    return NextResponse.json(rows);
  } catch (e) {
    console.error("ORDERS GET ERROR", e);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(["admin"]);

    const {
      customer_id,
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
      status,
      items
    } = await req.json();

    // Insert order
    const [result]: any = await db.query(
      `
      INSERT INTO orders 
      (customer_id, address, city, state, pincode, payment_method, payment_status, 
       subtotal, delivery_fee, discount, total_amount, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        customer_id,
        address,
        city,
        state || null,
        pincode,
        payment_method,
        payment_status || "PENDING",
        subtotal,
        delivery_fee || 0,
        discount || 0,
        total_amount,
        status || "PENDING"
      ]
    );

    const orderId = result.insertId;

    // Insert order items
    if (items && items.length > 0) {
      const itemValues = items.map((item: any) => [
        orderId,
        item.medicine_id,
        item.qty,
        item.price
      ]);

      await db.query(
        `INSERT INTO order_items (order_id, medicine_id, qty, price) VALUES ?`,
        [itemValues]
      );
    }

    return NextResponse.json({ success: true, orderId });
  } catch (e) {
    console.error("ORDER CREATE ERROR", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}