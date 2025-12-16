// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// Request body ka expected shape
type CheckoutItem = {
  id: number; // medicine id
  product_name?: string;
  mrp: number;
  qty: number;
};

type CheckoutBody = {
  customerId: number | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  pincode: string;
  paymentMode: "COD" | "UPI";
  items: CheckoutItem[];
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutBody;

    const {
      customerId,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      paymentMode,
      items,
    } = body;

    // ---------- Basic validation ----------
    if (!customerId) {
      return NextResponse.json(
        { error: "Login required before placing order" },
        { status: 400 }
      );
    }

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !addressLine1?.trim() ||
      !city?.trim() ||
      !pincode?.trim()
    ) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // normalize items
    const normalizedItems = items
      .map((it) => ({
        medicineId: Number(it.id),
        qty: Number(it.qty) || 1,
        price: Number(it.mrp) || 0,
      }))
      .filter((it) => it.medicineId && it.qty > 0 && it.price >= 0);

    if (normalizedItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // totals
    const subtotal = normalizedItems.reduce(
      (sum, it) => sum + it.price * it.qty,
      0
    );

    const deliveryFee = normalizedItems.length > 0 ? 25 : 0;
    const discount = 0;
    const totalAmount = subtotal + deliveryFee - discount;

    const fullAddress =
      addressLine1.trim() +
      (addressLine2 && addressLine2.trim() ? ", " + addressLine2.trim() : "");

    // ---------- Transaction ----------
    const conn = await (db as any).getConnection();
    try {
      await conn.beginTransaction();

      // NOTE: column order must match param order exactly.
      // Insert includes customer_id as the first column (matching your DB).
      const [orderResult] = await conn.query(
        `
        INSERT INTO orders (
          customer_id,
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
          total_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?)
      `,
        [
          customerId,
          fullName.trim(),
          phone.trim(),
          fullAddress,
          city.trim(),
          state ? state.trim() : null,
          pincode.trim(),
          paymentMode,
          subtotal,
          deliveryFee,
          discount,
          totalAmount,
        ]
      );

      const orderId = (orderResult as any).insertId as number;

      // order_items
      for (const it of normalizedItems) {
        await conn.query(
          `
          INSERT INTO order_items (
            order_id,
            medicine_id,
            qty,
            price,
            from_prescription
          ) VALUES (?, ?, ?, ?, ?)
        `,
          // from_prescription default 0 — client items don't indicate prescription here
          [orderId, it.medicineId, it.qty, it.price, 0]
        );
      }

      await conn.commit();

      return NextResponse.json(
        {
          success: true,
          orderId,
        },
        { status: 200 }
      );
    } catch (err) {
      await conn.rollback();
      console.error("CHECKOUT TX ERROR:", err);
      return NextResponse.json(
        { error: "Server error while placing order" },
        { status: 500 }
      );
    } finally {
      try {
        conn.release();
      } catch {
        // ignore
      }
    }
  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    return NextResponse.json(
      { error: "Server error while placing order" },
      { status: 500 }
    );
  }
}
