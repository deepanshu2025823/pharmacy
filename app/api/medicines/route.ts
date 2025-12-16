import { NextResponse } from "next/server";
import db from "@/lib/db";

// GET /api/medicines?q=search&limit=40
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const limit = Number(searchParams.get("limit") || "40");

    let sql =
      "SELECT id, product_id, product_name, marketer, product_form, `package`, qty, mrp, image_url FROM medicines";
    const params: any[] = [];

    if (q) {
      sql +=
        " WHERE product_name LIKE ? OR marketer LIKE ? OR product_id LIKE ?";
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    sql += " ORDER BY id ASC LIMIT ?";
    params.push(limit);

    const [rows] = await db.query(sql, params);

    const data = (rows as any[]).map((row) => {
      let imageUrl: string | undefined = row.image_url || undefined;

      // clean image url
      if (imageUrl && imageUrl.includes("|")) {
        imageUrl = imageUrl.split("|")[0].trim();
      }

      return {
        id: row.id,
        product_id: row.product_id,
        product_name: row.product_name,
        marketer: row.marketer,
        product_form: row.product_form,
        package: row.package,
        qty: row.qty,
        mrp: Number(row.mrp ?? 0),
        image_url: imageUrl,
      };
    });

    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/medicines error:", err);
    return NextResponse.json(
      { error: "Failed to load medicines" },
      { status: 500 }
    );
  }
}
