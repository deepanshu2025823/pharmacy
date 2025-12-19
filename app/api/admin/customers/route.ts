import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT 
        id, 
        name, 
        email, 
        phone, 
        address, 
        city, 
        pincode, 
        created_at 
      FROM customers 
      ORDER BY created_at DESC`
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}