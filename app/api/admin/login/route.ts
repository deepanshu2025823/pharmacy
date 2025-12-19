import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 }
      );
    }

    const [rows]: any = await db.query(
      `
      SELECT id, name, email, password_hash
      FROM admins
      WHERE email = ?
      LIMIT 1
      `,
      [email]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const admin = rows[0];

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { id: admin.id, role: "admin" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({
      success: true,
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (err) {
    console.error("ADMIN LOGIN ERROR", err);
    return NextResponse.json(
      { message: "Login failed" },
      { status: 500 }
    );
  }
}
