import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRole } from "@/app/api/_utils/auth";

/* ============ GET SINGLE MEDICINE ============ */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["admin"]);

    const { id } = params;

    const [rows]: any = await db.query(
      "SELECT * FROM medicines WHERE id = ? LIMIT 1",
      [id]
    );

    if (!rows.length) {
      return NextResponse.json(
        { message: "Medicine not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("GET MEDICINE ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/* ============ UPDATE MEDICINE ============ */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["admin"]);

    const { id } = params;
    const body = await req.json();

    await db.query(
      `
      UPDATE medicines SET
        product_name = ?,
        product_type = ?,
        marketer = ?,
        manufacturer = ?,
        mrp = ?,
        prescription_required = ?,
        status = ?,
        composition = ?,
        how_to_use = ?,
        image_url = ?
      WHERE id = ?
      `,
      [
        body.product_name ?? "",
        body.product_type ?? "",
        body.marketer ?? "",
        body.manufacturer ?? "",
        Number(body.mrp) || 0,
        Number(body.prescription_required) === 1 ? 1 : 0,
        body.status ?? "inactive",
        body.composition ?? "",
        body.how_to_use ?? "",
        body.image_url ?? "",
        id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("UPDATE MEDICINE ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/* ============ SOFT DELETE MEDICINE ============ */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["admin"]);

    const { id } = params;

    await db.query(
      "UPDATE medicines SET status = 'inactive' WHERE id = ?",
      [id]
    );

    return NextResponse.json({
      message: "Medicine deactivated successfully",
    });
  } catch (err) {
    console.error("SOFT DELETE MEDICINE ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
