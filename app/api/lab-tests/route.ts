// app/api/lab-tests/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const concern = (searchParams.get("concern") || "").trim();
    const popular = searchParams.get("popular");
    const limit = Number(searchParams.get("limit") || "8");

    let sql =
      "SELECT id, slug, name, short_description, concern, price, offer_price, tests_count, fasting_required FROM lab_tests";
    const params: any[] = [];

    const where: string[] = [];

    if (concern) {
      where.push("concern = ?");
      params.push(concern);
    }

    if (popular === "1" || popular === "true") {
      where.push("popular = 1");
    }

    if (where.length > 0) {
      sql += " WHERE " + where.join(" AND ");
    }

    sql += " ORDER BY created_at DESC LIMIT ?";
    params.push(limit);

    const [rows] = await db.query(sql, params);

    const data = (rows as any[]).map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      short_description: r.short_description || "",
      concern: r.concern || "",
      price: Number(r.price ?? 0),
      offer_price: Number(r.offer_price ?? 0),
      tests_count: r.tests_count ?? null,
      fasting_required: !!r.fasting_required,
    }));

    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/lab-tests error:", err);
    return NextResponse.json(
      { error: "Failed to load lab tests" },
      { status: 500 }
    );
  }
}
