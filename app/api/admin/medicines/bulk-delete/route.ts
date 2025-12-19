import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRole } from "@/app/api/_utils/auth";

export async function POST(req: Request) {
  try {
    await requireRole(["admin"]);

    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { message: "No medicines selected" },
        { status: 400 }
      );
    }

    await db.query(
      `UPDATE medicines SET status = 'inactive' WHERE id IN (${ids.map(() => "?").join(",")})`,
      ids
    );

    return NextResponse.json({
      message: "Selected medicines deactivated",
    });
  } catch (err) {
    console.error("BULK DELETE ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
