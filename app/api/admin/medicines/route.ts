import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRole } from "@/app/api/_utils/auth";

/* ================= GET ================= */

export async function GET(req: Request) {
  try {
    await requireRole(["admin", "staff"]);

    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.max(Number(searchParams.get("limit")) || 25, 1);
    const q = searchParams.get("q")?.trim() || "";
    const rx = searchParams.get("rx");
    const status = searchParams.get("status") || "all";

    const offset = (page - 1) * limit;

    let where = "WHERE m.product_name LIKE ?";
    const params: any[] = [`%${q}%`];

    if (rx === "1" || rx === "0") {
      where += " AND m.prescription_required = ?";
      params.push(Number(rx));
    }

    if (status !== "all") {
      where += " AND m.status = ?";
      params.push(status);
    }

    const [rows]: any = await db.query(
      `
      SELECT
        m.id,
        m.product_name,
        m.marketer,
        m.product_type,
        m.mrp,
        m.prescription_required,
        m.status,
        COUNT(pr.id) AS review_count
      FROM medicines m
      LEFT JOIN product_reviews pr 
        ON pr.product_id = m.id
      ${where}
      GROUP BY m.id
      ORDER BY m.id DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const [[countResult]]: any = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM medicines m
      ${where}
      `,
      params
    );

    return NextResponse.json({
      data: rows,
      page,
      total: Number(countResult.total),
      totalPages: Math.ceil(countResult.total / limit),
    });
  } catch (err: any) {
    console.error("MEDICINES GET ERROR", err);

    if (err?.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/* ================= POST ================= */

export async function POST(req: Request) {
  try {
    await requireRole(["admin"]);

    const body = await req.json();
    const {
      product_name,
      marketer,
      product_type,
      mrp,
      prescription_required,
      status = "active",
    } = body;

    /* ===== Validation ===== */
    if (!product_name || !mrp) {
      return NextResponse.json(
        { message: "Product name & MRP required" },
        { status: 400 }
      );
    }

    /* ===== Duplicate check ===== */
    const [[exists]]: any = await db.query(
      "SELECT id FROM medicines WHERE product_name = ?",
      [product_name]
    );

    if (exists) {
      return NextResponse.json(
        { message: "Medicine already exists" },
        { status: 409 }
      );
    }

    /* ===== Insert ===== */
    const [result]: any = await db.query(
      `
      INSERT INTO medicines 
      (product_name, marketer, product_type, mrp, prescription_required, status)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        product_name,
        marketer || null,
        product_type || null,
        mrp,
        prescription_required ? 1 : 0,
        status,
      ]
    );

    return NextResponse.json(
      { message: "Medicine added", id: result.insertId },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("MEDICINES POST ERROR", err);

    if (err?.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
