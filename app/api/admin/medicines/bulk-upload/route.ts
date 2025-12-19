import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import db from "@/lib/db";
import { requireRole } from "@/app/api/_utils/auth";

export async function POST(req: NextRequest) {
  try {
    const user = requireRole(req, ["admin"]);
    const form = await req.formData();
    const file = form.get("file") as File;

    const buffer = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buffer);
    const sheet = XLSX.utils.sheet_to_json<any>(
      wb.Sheets[wb.SheetNames[0]]
    );

    await db.query("START TRANSACTION");

    for (const row of sheet) {
      await db.query(
        `
        INSERT INTO medicines
        (product_name, marketer, mrp, prescription_required, status)
        VALUES (?, ?, ?, ?, 'active')
        `,
        [
          row.product_name,
          row.marketer,
          row.mrp,
          row.prescription_required ? 1 : 0,
        ]
      );
    }

    await db.query(
      `
      INSERT INTO audit_logs
      (admin_id, action, entity)
      VALUES (?, 'bulk_upload', 'medicine')
      `,
      [user.id]
    );

    await db.query("COMMIT");

    return NextResponse.json({ success: true });
  } catch (e: any) {
    await db.query("ROLLBACK");
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
