import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();

  if (!user) return NextResponse.json({ count: 0 });

  const result = await db.query(
    `SELECT SUM(quantity) AS count FROM cart WHERE user_id = ?`,
    [user.id]
  );

  return NextResponse.json({ count: result[0]?.count || 0 });
}
