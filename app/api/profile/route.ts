import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("customerId"));

  if (!id) return new NextResponse("Invalid customerId", { status: 400 });

  const [rows]: any = await db.query(
    "SELECT id, name, email, phone, address, city, pincode, created_at FROM customers WHERE id = ? LIMIT 1",
    [id]
  );

  if (!rows.length) return new NextResponse("Customer not found", { status: 404 });

  return NextResponse.json({ profile: rows[0] });
}

export async function PUT(req: NextRequest) {
  const { id, name, email, phone, address, city, pincode } = await req.json();

  if (!id) return new NextResponse("Missing id", { status: 400 });

  await db.query(
    "UPDATE customers SET name=?, email=?, phone=?, address=?, city=?, pincode=? WHERE id=?",
    [name, email, phone, address, city, pincode, id]
  );

  const [rows]: any = await db.query(
    "SELECT id, name, email, phone, address, city, pincode, created_at FROM customers WHERE id = ?",
    [id]
  );

  return NextResponse.json({ profile: rows[0] });
}

export async function PATCH(req: NextRequest) {
  const { id, currentPassword, newPassword } = await req.json();

  const [rows]: any = await db.query(
    "SELECT password_hash FROM customers WHERE id = ?",
    [id]
  );

  if (!rows.length) return new NextResponse("User not found", { status: 404 });

  const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!valid) return new NextResponse("Wrong current password", { status: 400 });

  const hash = await bcrypt.hash(newPassword, 10);
  await db.query("UPDATE customers SET password_hash=? WHERE id=?", [hash, id]);

  return NextResponse.json({ ok: true });
}
