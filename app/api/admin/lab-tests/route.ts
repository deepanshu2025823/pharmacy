import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRole } from "@/app/api/_utils/auth";

/* ================= GET ALL LAB TESTS ================= */
export async function GET() {
  try {
    await requireRole(["admin", "staff"]);

    const [rows]: any = await db.query(`
      SELECT
        id,
        slug,
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
        created_at
      FROM lab_tests
      ORDER BY id DESC
    `);

    return NextResponse.json(rows);
  } catch (e) {
    console.error("LAB TEST GET ERROR", e);
    return NextResponse.json([], { status: 500 });
  }
}

/* ================= CREATE LAB TEST ================= */
export async function POST(req: Request) {
  try {
    await requireRole(["admin"]);

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
      status = "active",
    } = await req.json();

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    await db.query(
      `
      INSERT INTO lab_tests
      (slug, name, short_description, concern, price, offer_price, tests_count, fasting_required, popular, description, image_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      ]
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("LAB TEST CREATE ERROR", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
