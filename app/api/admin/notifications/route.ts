import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const [rows] = await db.query(
    `
    SELECT id, message, link, created_at
    FROM notifications
    ORDER BY id DESC
    LIMIT 10
  `
  );

  return NextResponse.json(rows);
}
