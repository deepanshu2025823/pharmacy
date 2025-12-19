import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRole } from "@/app/api/_utils/auth";

/* ===== UPDATE ===== */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { id } = await params;

    const {
      name,
      short_description,
      concern,
      price,
      offer_price,
      tests_count,
      fasting_required,
      popular,
      description,
      image_url,
      status,
    } = await req.json();

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    await db.query(
      `
      UPDATE lab_tests
      SET slug=?, name=?, short_description=?, concern=?, price=?, offer_price=?, 
          tests_count=?, fasting_required=?, popular=?, description=?, image_url=?, status=?
      WHERE id=?
      `,
      [
        slug,
        name,
        short_description || null,
        concern || null,
        price,
        offer_price,
        tests_count || 0,
        fasting_required || 0,
        popular || 0,
        description || null,
        image_url || null,
        status,
        id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("LAB TEST UPDATE ERROR", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/* ===== DELETE ===== */
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { id } = await params;

    await db.query(`DELETE FROM lab_tests WHERE id=?`, [id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("LAB TEST DELETE ERROR", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}