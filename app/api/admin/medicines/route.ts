import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRole } from "@/app/api/_utils/auth";

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

    /* ================= WHERE ================= */

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

    /* ================= DATA ================= */

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

    /* ================= TOTAL ================= */

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
    console.error("MEDICINES API ERROR", err);

    if (err?.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
