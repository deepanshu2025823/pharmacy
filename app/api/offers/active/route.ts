import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const offers = await db.query(`
    SELECT * FROM offers
    WHERE status = 1 AND expiry_date >= CURDATE()
  `);

  return NextResponse.json({ offers });
}
