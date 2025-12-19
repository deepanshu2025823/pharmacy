import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q) {
      return NextResponse.json([]);
    }

    const like = `%${q}%`;

    const [rows] = await db.query(
      `
      SELECT type, id, title FROM (
        SELECT
          'medicine' AS type,
          id,
          CONVERT(product_name USING utf8mb4) COLLATE utf8mb4_unicode_ci AS title
        FROM medicines
        WHERE product_name LIKE ?

        UNION ALL

        SELECT
          'order' AS type,
          id,
          CONVERT(CONCAT('Order #', id) USING utf8mb4) COLLATE utf8mb4_unicode_ci
        FROM orders
        WHERE CAST(id AS CHAR) LIKE ?

        UNION ALL

        SELECT
          'customer' AS type,
          id,
          CONVERT(name USING utf8mb4) COLLATE utf8mb4_unicode_ci
        FROM customers
        WHERE name LIKE ?
      ) x
      LIMIT 10
      `,
      [like, like, like]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json([]);
  }
}
