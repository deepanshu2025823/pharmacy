import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const id = cookieStore.get("pharmacy_user_id")?.value;

    if (!id) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    const [rows] = await db.query(
      "SELECT id, name, email, phone FROM users WHERE id = ? LIMIT 1",
      [Number(id)]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    const row: any = rows[0];

    return NextResponse.json(
      {
        data: {
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("AUTH /me error", err);
    return NextResponse.json(
      { error: "Failed to load user" },
      { status: 500 }
    );
  }
}
