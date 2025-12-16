// app/api/prescriptions/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

/**
 * Helper: take a filename and convert to a SQL-safe LIKE pattern
 * e.g. "Jupiros_Gold.jpg" -> "%jupiros%gold%"
 */
function filenameToLikePatterns(filename: string) {
  const base = filename.replace(/\.[^.]+$/, ""); // remove extension
  const tokens = base
    .replace(/[_\-\.\,]+/g, " ")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8); // limit tokens
  if (!tokens.length) return ["%"];
  const pattern = "%" + tokens.join("%") + "%";
  return [pattern];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = Number(searchParams.get("customerId") || "0");

    let rows: any[] = [];

    if (customerId > 0) {
      const [result] = (await db.query(
        `
        SELECT
          id,
          customer_id,
          file_url,
          notes,
          status,
          created_at
        FROM prescriptions
        WHERE customer_id = ?
        ORDER BY created_at DESC
        `,
        [customerId]
      )) as any;
      rows = result;
    } else {
      const [result] = (await db.query(
        `
        SELECT
          id,
          customer_id,
          file_url,
          notes,
          status,
          created_at
        FROM prescriptions
        ORDER BY created_at DESC
        LIMIT 50
        `
      )) as any;
      rows = result;
    }

    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error("GET /api/prescriptions error", err);
    return NextResponse.json(
      { error: "Failed to load prescriptions" },
      { status: 500 }
    );
  }
}

// POST /api/prescriptions
// Body: { customerId: number, fileUrl: string, notes?: string }
// After insert: try to find matching medicines and return them as matchedProducts[]
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const customerId = Number(body?.customerId || 0);
    const fileUrl = (body?.fileUrl || "").trim();
    const notes = body?.notes ? String(body.notes) : null;

    if (!customerId || !fileUrl) {
      return NextResponse.json(
        { error: "customerId and fileUrl are required" },
        { status: 400 }
      );
    }

    // Insert the prescription
    const [result] = (await db.query(
      `
      INSERT INTO prescriptions (customer_id, file_url, notes)
      VALUES (?, ?, ?)
      `,
      [customerId, fileUrl, notes]
    )) as any;

    const insertedId = result.insertId as number;

    // Read the created record
    const [rows] = (await db.query(
      `
      SELECT
        id,
        customer_id,
        file_url,
        notes,
        status,
        created_at
      FROM prescriptions
      WHERE id = ?
      LIMIT 1
      `,
      [insertedId]
    )) as any;

    const created = rows[0] ?? null;

    // --- Simple matching logic: try to match the filename against medicines.product_name OR medicines.image_url ---
    const patterns = filenameToLikePatterns(fileUrl);
    let matchedProducts: any[] = [];

    if (patterns.length > 0) {
      try {
        const [mrows] = (await db.query(
          `
          SELECT id AS medicine_id, product_name, mrp AS price, image_url
          FROM medicines
          WHERE LOWER(product_name) LIKE LOWER(?)
             OR LOWER(image_url) LIKE LOWER(?)
          LIMIT 10
          `,
          [patterns[0], patterns[0]]
        )) as any;

        matchedProducts = (mrows || []).map((r: any) => ({
          medicine_id: r.medicine_id,
          product_name: r.product_name,
          price: Number(r.price || 0),
          image_url: r.image_url ? String(r.image_url).split("|")[0].trim() : null,
          qty: 1,
        }));
      } catch (matchErr) {
        console.error("Prescription matching query failed", matchErr);
      }
    }

    return NextResponse.json({ data: created, matchedProducts }, { status: 201 });
  } catch (err) {
    console.error("POST /api/prescriptions error", err);
    return NextResponse.json(
      { error: "Failed to create prescription" },
      { status: 500 }
    );
  }
}
