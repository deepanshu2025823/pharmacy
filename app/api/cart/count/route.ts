// app/api/cart/count/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // For now, return 0 without authentication
    // You can add authentication later using next-auth or other solutions
    
    // If you want to use session/cookies in the future:
    // const session = await getServerSession();
    // if (!session?.user?.id) return NextResponse.json({ count: 0 });

    // Temporary: return 0 for unauthenticated users
    return NextResponse.json({ 
      count: 0,
      success: true 
    });

    // When you implement authentication, uncomment this:
    /*
    const connection = await pool.getConnection();
    try {
      const [result]: any = await connection.query(
        `SELECT SUM(quantity) AS count FROM cart WHERE user_id = ?`,
        [userId]
      );
      return NextResponse.json({ count: result[0]?.count || 0 });
    } finally {
      connection.release();
    }
    */
  } catch (error) {
    console.error("Error fetching cart count:", error);
    return NextResponse.json({ 
      count: 0,
      success: false 
    }, { status: 200 });
  }
}