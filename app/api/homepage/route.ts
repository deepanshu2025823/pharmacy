import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [
      settings,
      features,
      offers,
      labPackages,
      whyChoose
    ] = await Promise.all([
      db.query(`SELECT site_name, logo FROM settings LIMIT 1`),
      db.query(`SELECT * FROM homepage_sections WHERE status = 1 ORDER BY sort_order`),
      db.query(`SELECT * FROM offers WHERE status = 1 AND expiry_date >= CURDATE()`),
      db.query(`SELECT * FROM lab_packages WHERE status = 1 ORDER BY sort_order`),
      db.query(`SELECT * FROM why_choose_us WHERE status = 1`)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        settings: settings[0],
        features,
        offers,
        labPackages,
        whyChoose
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
