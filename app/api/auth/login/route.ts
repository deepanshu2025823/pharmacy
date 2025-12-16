import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, password } = body || {};

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Mobile / email and password required" },
        { status: 400 }
      );
    }

    const [rows] = await db.query(
      "SELECT id, name, email, phone, address, city, pincode, password_hash FROM customers WHERE phone = ? OR email = ? LIMIT 1",
      [identifier, identifier]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 400 }
      );
    }

    const row: any = rows[0];

    const ok = await bcrypt.compare(String(password), row.password_hash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 400 }
      );
    }

    const user = {
      id: row.id,
      name: row.name,
      email: row.email || "",
      phone: row.phone,
      address: row.address,
      city: row.city,
      pincode: row.pincode,
    };

    return NextResponse.json({ data: user });
  } catch (err) {
    console.error("LOGIN ERROR", err);
    return NextResponse.json(
      { error: "Unable to login right now" },
      { status: 500 }
    );
  }
}
