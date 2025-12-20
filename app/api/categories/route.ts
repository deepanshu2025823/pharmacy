import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const categories = await db.query(`
    SELECT id, name, icon, slug
    FROM categories
    WHERE status = 1
    ORDER BY sort_order
  `);

  return NextResponse.json({ success: true, categories });
}
