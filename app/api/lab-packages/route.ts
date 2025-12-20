import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const packages = await db.query(`
    SELECT * FROM lab_packages
    WHERE status = 1
  `);

  return NextResponse.json({ packages });
}
