import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT id, name, phone FROM customers ORDER BY id DESC"
    );
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
