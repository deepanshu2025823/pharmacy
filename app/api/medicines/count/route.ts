import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const connection = await pool.getConnection();

    try {
      const [result]: any = await connection.query(
        "SELECT COUNT(*) as total FROM medicines WHERE status = 'active'"
      );

      const total = result[0]?.total || 0;

      return NextResponse.json({ 
        total, 
        success: true,
        timestamp: new Date().toISOString()
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching medicines count:", error);
    
    return NextResponse.json({ 
      total: 0, 
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch count" 
    }, { status: 200 });
  }
}
