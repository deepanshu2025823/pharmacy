import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRole } from "@/app/api/_utils/auth";

/* ============ RESTORE FROM TRASH ============ */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);

    const { id } = await params;

    // Check if medicine exists
    const [[medicine]]: any = await db.query(
      "SELECT id, status FROM medicines WHERE id = ? LIMIT 1",
      [id]
    );

    if (!medicine) {
      return NextResponse.json(
        { message: "Medicine not found" },
        { status: 404 }
      );
    }

    if (medicine.status !== "trash") {
      return NextResponse.json(
        { message: "Medicine is not in trash" },
        { status: 400 }
      );
    }

    // Restore to active status
    await db.query(
      "UPDATE medicines SET status = 'active' WHERE id = ?",
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Medicine restored successfully",
    });
  } catch (err: any) {
    console.error("RESTORE ERROR:", err);

    if (err?.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}