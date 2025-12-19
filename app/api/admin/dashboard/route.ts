import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [[orders]]: any = await db.query(
      "SELECT COUNT(*) AS total FROM orders"
    );

    const [[medicines]]: any = await db.query(
      "SELECT COUNT(*) AS total FROM medicines"
    );

    const [[labTests]]: any = await db.query(
      "SELECT COUNT(*) AS total FROM lab_tests"
    );

    const [[customers]]: any = await db.query(
      "SELECT COUNT(*) AS total FROM customers"
    );

    return NextResponse.json({
      orders: orders?.total ?? 0,
      medicines: medicines?.total ?? 0,
      labTests: labTests?.total ?? 0,
      customers: customers?.total ?? 0,
      chart: [
        { name: "Orders", value: orders?.total ?? 0 },
        { name: "Medicines", value: medicines?.total ?? 0 },
        { name: "Lab Tests", value: labTests?.total ?? 0 },
        { name: "Customers", value: customers?.total ?? 0 },
      ],
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        orders: 0,
        medicines: 0,
        labTests: 0,
        customers: 0,
        chart: [],
      },
      { status: 500 }
    );
  }
}
