import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    // Get total counts with error handling for each
    let orders = 0;
    let medicines = 0;
    let labTests = 0;
    let customers = 0;
    let revenue = 0;
    let pendingOrders = 0;
    let todayOrders = 0;
    let todayRevenue = 0;

    try {
      const [[ordersResult]]: any = await db.query(
        "SELECT COUNT(*) AS total FROM orders"
      );
      orders = ordersResult?.total ?? 0;
    } catch (e) {
      console.log("Orders count error:", e);
    }

    try {
      const [[medicinesResult]]: any = await db.query(
        "SELECT COUNT(*) AS total FROM medicines"
      );
      medicines = medicinesResult?.total ?? 0;
    } catch (e) {
      console.log("Medicines count error:", e);
    }

    try {
      const [[labTestsResult]]: any = await db.query(
        "SELECT COUNT(*) AS total FROM lab_tests WHERE status = 'active'"
      );
      labTests = labTestsResult?.total ?? 0;
    } catch (e) {
      console.log("Lab tests count error:", e);
    }

    try {
      const [[customersResult]]: any = await db.query(
        "SELECT COUNT(*) AS total FROM customers"
      );
      customers = customersResult?.total ?? 0;
    } catch (e) {
      console.log("Customers count error:", e);
    }

    try {
      const [[revenueResult]]: any = await db.query(
        "SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE status != 'cancelled'"
      );
      revenue = revenueResult?.total ?? 0;
    } catch (e) {
      console.log("Revenue calculation error:", e);
    }

    try {
      const [[pendingOrdersResult]]: any = await db.query(
        "SELECT COUNT(*) AS total FROM orders WHERE status = 'PENDING'"
      );
      pendingOrders = pendingOrdersResult?.total ?? 0;
    } catch (e) {
      console.log("Pending orders error:", e);
    }

    try {
      const [[todayOrdersResult]]: any = await db.query(
        "SELECT COUNT(*) AS total FROM orders WHERE DATE(created_at) = CURDATE()"
      );
      todayOrders = todayOrdersResult?.total ?? 0;
    } catch (e) {
      console.log("Today orders error:", e);
    }

    try {
      const [[todayRevenueResult]]: any = await db.query(
        "SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE DATE(created_at) = CURDATE() AND status != 'cancelled'"
      );
      todayRevenue = todayRevenueResult?.total ?? 0;
    } catch (e) {
      console.log("Today revenue error:", e);
    }

    // Get recent orders
    let recentOrders = [];
    try {
      const [ordersResult]: any = await db.query(
        `SELECT 
          o.id,
          o.customer_name,
          o.total_amount,
          o.status,
          o.created_at,
          o.payment_method
        FROM orders o
        ORDER BY o.created_at DESC
        LIMIT 5`
      );
      recentOrders = ordersResult || [];
    } catch (e) {
      console.log("Recent orders error:", e);
    }

    // Get low stock medicines - Try different column names
    let lowStockMedicines = [];
    try {
      // First, let's check what columns exist in medicines table
      const [columns]: any = await db.query(
        "SHOW COLUMNS FROM medicines"
      );
      
      const columnNames = columns.map((col: any) => col.Field);
      console.log("Medicines table columns:", columnNames);

      // Determine the correct column name for medicine name
      let nameColumn = 'brand_name';
      if (columnNames.includes('medicine_name')) {
        nameColumn = 'medicine_name';
      } else if (columnNames.includes('name')) {
        nameColumn = 'name';
      } else if (columnNames.includes('brand_name')) {
        nameColumn = 'brand_name';
      } else if (columnNames.includes('product_name')) {
        nameColumn = 'product_name';
      }

      // Determine price column
      let priceColumn = 'mrp';
      if (columnNames.includes('price')) {
        priceColumn = 'price';
      } else if (columnNames.includes('mrp')) {
        priceColumn = 'mrp';
      } else if (columnNames.includes('selling_price')) {
        priceColumn = 'selling_price';
      }

      // Determine stock quantity column
      let stockColumn = 'qty';
      if (columnNames.includes('stock_qty')) {
        stockColumn = 'stock_qty';
      } else if (columnNames.includes('qty')) {
        stockColumn = 'qty';
      } else if (columnNames.includes('quantity')) {
        stockColumn = 'quantity';
      } else if (columnNames.includes('stock')) {
        stockColumn = 'stock';
      }

      const [medicinesResult]: any = await db.query(
        `SELECT 
          ${nameColumn} as name,
          ${stockColumn} as stock_qty,
          ${priceColumn} as price
        FROM medicines
        WHERE ${stockColumn} < 20
        ORDER BY ${stockColumn} ASC
        LIMIT 5`
      );
      lowStockMedicines = medicinesResult || [];
    } catch (e) {
      console.log("Low stock medicines error:", e);
    }

    // Get monthly statistics for chart
    let monthlyStats = [];
    try {
      const [statsResult]: any = await db.query(
        `SELECT 
          DATE_FORMAT(created_at, '%b') as name,
          COUNT(*) as orders,
          COALESCE(SUM(total_amount), 0) as revenue
        FROM orders
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b')
        ORDER BY DATE_FORMAT(created_at, '%Y-%m') ASC`
      );
      monthlyStats = statsResult || [];
    } catch (e) {
      console.log("Monthly stats error:", e);
    }

    // Get popular medicines
    let popularMedicines = [];
    try {
      // Get medicine table columns again for the join
      const [columns]: any = await db.query(
        "SHOW COLUMNS FROM medicines"
      );
      
      const columnNames = columns.map((col: any) => col.Field);

      let nameColumn = 'brand_name';
      if (columnNames.includes('medicine_name')) {
        nameColumn = 'medicine_name';
      } else if (columnNames.includes('name')) {
        nameColumn = 'name';
      } else if (columnNames.includes('brand_name')) {
        nameColumn = 'brand_name';
      } else if (columnNames.includes('product_name')) {
        nameColumn = 'product_name';
      }

      const [medicinesResult]: any = await db.query(
        `SELECT 
          m.${nameColumn} as name,
          COUNT(oi.id) as order_count,
          SUM(oi.qty) as total_qty
        FROM order_items oi
        JOIN medicines m ON oi.medicine_id = m.id
        GROUP BY m.id, m.${nameColumn}
        ORDER BY order_count DESC
        LIMIT 5`
      );
      popularMedicines = medicinesResult || [];
    } catch (e) {
      console.log("Popular medicines error:", e);
    }

    return NextResponse.json({
      stats: {
        orders,
        medicines,
        labTests,
        customers,
        revenue,
        pendingOrders,
        todayOrders,
        todayRevenue,
      },
      recentOrders,
      lowStockMedicines,
      monthlyChart: monthlyStats,
      popularMedicines,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        stats: {
          orders: 0,
          medicines: 0,
          labTests: 0,
          customers: 0,
          revenue: 0,
          pendingOrders: 0,
          todayOrders: 0,
          todayRevenue: 0,
        },
        recentOrders: [],
        lowStockMedicines: [],
        monthlyChart: [],
        popularMedicines: [],
      },
      { status: 500 }
    );
  }
}