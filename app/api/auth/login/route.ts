import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: Request) {
  try {
    if (!JWT_SECRET) {
      return NextResponse.json(
        { message: "Server misconfigured" },
        { status: 500 }
      );
    }

    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Email or mobile and password required" },
        { status: 400 }
      );
    }

    const [rows]: any = await db.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        address,
        city,
        pincode,
        password_hash
      FROM customers
      WHERE email = ? OR phone = ?
      LIMIT 1
      `,
      [identifier, identifier]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = rows[0];

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { id: user.id, role: "user" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    (await cookies()).set("user_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        pincode: user.pincode,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR", err);
    return NextResponse.json(
      { message: "Login failed" },
      { status: 500 }
    );
  }
}
