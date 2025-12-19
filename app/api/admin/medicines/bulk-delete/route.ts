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

    // Validate that all ids are numbers
    const validIds = ids.filter((id) => !isNaN(Number(id)));

    if (validIds.length === 0) {
      return NextResponse.json(
        { message: "No valid medicine IDs provided" },
        { status: 400 }
      );
    }

    // Create placeholders for SQL query
    const placeholders = validIds.map(() => "?").join(",");

    await db.query(
      `UPDATE medicines SET status = 'inactive' WHERE id IN (${placeholders})`,
      validIds
    );

    return NextResponse.json({
      success: true,
      message: `${validIds.length} medicine(s) deactivated successfully`,
    });
  } catch (err) {
    console.error("BULK DEACTIVATE ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}