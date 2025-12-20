import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (!q) return NextResponse.json({ results: [] });

  const results = await db.query(`
    SELECT id, name, image, selling_price
    FROM medicines
    WHERE status = 1 AND name LIKE ?
    LIMIT 10
  `, [`%${q}%`]);

  return NextResponse.json({ results });
}
