import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRole } from "@/app/api/_utils/auth";

/* ============ MOVE TO TRASH ============ */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);

    const { id } = await params;

    // Check if medicine exists
    const [rows]: any = await db.query(
      "SELECT id, status FROM medicines WHERE id = ? LIMIT 1",
      [id]
    );

    if (!rows.length) {
      return NextResponse.json(
        { message: "Medicine not found" },
        { status: 404 }
      );
    }

    if (rows[0].status === "trash") {
      return NextResponse.json(
        { message: "Medicine is already in trash" },
        { status: 400 }
      );
    }

    // Move to trash
    await db.query(
      "UPDATE medicines SET status = 'trash' WHERE id = ?",
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Medicine moved to trash successfully",
    });
  } catch (err) {
    console.error("MOVE TO TRASH ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}