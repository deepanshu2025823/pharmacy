import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRole } from "@/app/api/_utils/auth";

/* ============ GET SINGLE MEDICINE ============ */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);

    const { id } = await params;

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);

    const { id } = await params;
    const body = await req.json();

    await db.query(
  `UPDATE medicines SET
    product_name = ?,
    product_type = ?,
    marketer = ?,
    manufacturer = ?,
    mrp = ?,
    pack_size = ?,
    units = ?,
    prescription_required = ?,
    status = ?,
    composition = ?,
    how_to_use = ?,
    side_effects = ?,
    safety_advice = ?,
    key_benefits = ?,
    storage_instructions = ?,
    image_url = ?
  WHERE id = ?`,
  [
    body.product_name,
    body.product_type,
    body.marketer,
    body.manufacturer,
    body.mrp,
    body.pack_size,
    body.units,
    body.prescription_required,
    body.status,
    body.composition,
    body.how_to_use,
    body.side_effects,
    body.safety_advice,
    body.key_benefits,
    body.storage_instructions,
    body.image_url,
    id
  ]
);

    return NextResponse.json({ 
      success: true,
      message: "Medicine updated successfully"
    });
  } catch (err) {
    console.error("UPDATE MEDICINE ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/* ============ SOFT DELETE MEDICINE ============ */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);

    const { id } = await params;

    // First check if medicine exists
    const [rows]: any = await db.query(
      "SELECT id FROM medicines WHERE id = ? LIMIT 1",
      [id]
    );

    if (!rows.length) {
      return NextResponse.json(
        { message: "Medicine not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting status to inactive
    await db.query(
      "UPDATE medicines SET status = 'inactive' WHERE id = ?",
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Medicine deactivated successfully",
    });
  } catch (err) {
    console.error("SOFT DELETE MEDICINE ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}