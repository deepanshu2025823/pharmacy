// app/api/dashboard/stats/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const connection = await pool.getConnection();

    try {
      // Get total medicines count
      const [medicinesResult]: any = await connection.query(
        "SELECT COUNT(*) as count FROM medicines WHERE status = 'active'"
      );
      const totalMedicines = medicinesResult[0]?.count || 0;

      // Get total lab tests count
      const [labTestsResult]: any = await connection.query(
        "SELECT COUNT(*) as count FROM lab_tests WHERE status = 'active'"
      );
      const totalLabTests = labTestsResult[0]?.count || 0;

      // Get total orders count
      const [ordersResult]: any = await connection.query(
        "SELECT COUNT(*) as count FROM orders"
      );
      const totalOrders = ordersResult[0]?.count || 0;

      // Get total customers count
      const [customersResult]: any = await connection.query(
        "SELECT COUNT(*) as count FROM customers"
      );
      const totalCustomers = customersResult[0]?.count || 0;

      // Get recent orders (today)
      const [recentOrdersResult]: any = await connection.query(
        "SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()"
      );
      const recentOrders = recentOrdersResult[0]?.count || 0;

      const stats = {
        totalMedicines,
        totalLabTests,
        totalOrders,
        totalCustomers,
        recentOrders,
      };

      return NextResponse.json(stats);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      {
        totalMedicines: 0,
        totalLabTests: 0,
        totalOrders: 0,
        totalCustomers: 0,
        recentOrders: 0,
      },
      { status: 500 }
    );
  }
}