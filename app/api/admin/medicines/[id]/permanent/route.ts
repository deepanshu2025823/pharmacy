import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRole } from "@/app/api/_utils/auth";

/* ============ PERMANENT DELETE ============ */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);

    const params = await context.params;
    const id = params.id;

    // Check if medicine exists and is in trash
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

    // Only allow permanent delete if medicine is in trash
    if (medicine.status !== "trash") {
      return NextResponse.json(
        { message: "Medicine must be in trash before permanent deletion" },
        { status: 400 }
      );
    }

    // Permanently delete from database
    await db.query("DELETE FROM medicines WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: "Medicine permanently deleted",
    });
  } catch (err: any) {
    console.error("PERMANENT DELETE ERROR:", err);

    if (err?.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'DELETE, OPTIONS',
    },
  });
}