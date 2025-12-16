import { NextResponse } from "next/server";
import db from "@/lib/db";
import type { ProductReview } from "@/app/product/[id]/page";

// GET /api/reviews?product_id=8
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("product_id");

  if (!productId) {
    return NextResponse.json(
      { error: "product_id is required" },
      { status: 400 }
    );
  }

  try {
    const [rows] = await db.query(
      "SELECT id, product_id, name, rating, comment, created_at FROM product_reviews WHERE product_id = ? ORDER BY created_at DESC",
      [productId]
    );

    const data: ProductReview[] = (rows as any[]).map((r) => ({
      id: r.id,
      product_id: r.product_id,
      name: r.name,
      rating: Number(r.rating ?? 0),
      comment: r.comment || "",
      created_at: r.created_at
        ? new Date(r.created_at).toISOString()
        : new Date().toISOString(),
    }));

    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/reviews error:", err);
    return NextResponse.json(
      { error: "Failed to load reviews" },
      { status: 500 }
    );
  }
}

// POST /api/reviews
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { product_id, name, rating, comment } = body || {};

    if (!product_id || !name || !rating) {
      return NextResponse.json(
        { error: "product_id, name & rating are required" },
        { status: 400 }
      );
    }

    const createdAt = new Date();

    const [result] = await db.query(
      "INSERT INTO product_reviews (product_id, name, rating, comment, created_at) VALUES (?, ?, ?, ?, ?)",
      [product_id, name, rating, comment || "", createdAt]
    );

    const insertedId = (result as any).insertId;

    const review: ProductReview = {
      id: insertedId,
      product_id,
      name,
      rating: Number(rating),
      comment: comment || "",
      created_at: createdAt.toISOString(),
    };

    return NextResponse.json({ data: review }, { status: 201 });
  } catch (err) {
    console.error("POST /api/reviews error:", err);
    return NextResponse.json(
      { error: "Failed to save review" },
      { status: 500 }
    );
  }
}
