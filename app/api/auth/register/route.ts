import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      password,
      address,
      city,
      pincode,
    } = body || {};

    if (!name || !phone || !password || !address || !city || !pincode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // already exists?
    const [existingRows] = await db.query(
      "SELECT id FROM customers WHERE phone = ? OR (email IS NOT NULL AND email = ?) LIMIT 1",
      [phone, email || null]
    );

    if (Array.isArray(existingRows) && existingRows.length > 0) {
      return NextResponse.json(
        { error: "Account already exists for this phone/email" },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(String(password), 10);

    const [result] = await db.query(
      "INSERT INTO customers (name, email, phone, password_hash, address, city, pincode) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, email || null, phone, hash, address, city, pincode]
    );

    const id = (result as any).insertId;

    const user = {
      id,
      name,
      email: email || "",
      phone,
      address,
      city,
      pincode,
    };

    return NextResponse.json({ data: user });
  } catch (err) {
    console.error("REGISTER ERROR", err);
    return NextResponse.json(
      { error: "Unable to register right now" },
      { status: 500 }
    );
  }
}
