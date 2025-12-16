import { NextResponse } from "next/server";
import db from "@/lib/db";

// GET /api/medicine/:id
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || id === "[id]") {
    return NextResponse.json(
      { error: "Invalid product id" },
      { status: 400 }
    );
  }

  try {
    const [rows] = await db.query(
      "SELECT id, product_id, product_name, marketer, product_form, `package`, qty, mrp, image_url FROM medicines WHERE id = ? LIMIT 1",
      [id]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const row: any = rows[0];

    let imageUrl: string | undefined = row.image_url || undefined;
    if (imageUrl && imageUrl.includes("|")) {
      imageUrl = imageUrl.split("|")[0].trim();
    }

    const product = {
      ...row,
      mrp: Number(row.mrp ?? 0),
      image_url: imageUrl,
    };

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error("GET /api/medicine/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to load product" },
      { status: 500 }
    );
  }
}
