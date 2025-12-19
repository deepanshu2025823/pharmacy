import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRole } from "@/app/api/_utils/auth";

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

    if (!name || !price) {
      return NextResponse.json(
        { message: "Name and price required" },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    await db.query(
      `
      INSERT INTO lab_tests
      (slug, name, short_description, concern, price, offer_price,
       tests_count, fasting_required, popular, description, image_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        slug,
        name,
        short_description || null,
        concern || null,
        price,
        offer_price || null,
        tests_count || 0,
        fasting_required ? 1 : 0,
        popular ? 1 : 0,
        description || null,
        image_url || null,
        status,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("LAB TEST ERROR", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
