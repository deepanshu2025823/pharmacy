import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import db from "@/lib/db";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const [rows]: any = await db.query(
    "SELECT * FROM admins WHERE email = ? LIMIT 1",
    [email]
  );

  if (!rows.length) {
    return NextResponse.json({ error: "Invalid" }, { status: 401 });
  }

  const admin = rows[0];
  const match = await bcrypt.compare(password, admin.password_hash);

  if (!match) {
    return NextResponse.json({ error: "Invalid" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set("admin_auth", admin.id.toString(), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24, 
  });

  return response;
}
