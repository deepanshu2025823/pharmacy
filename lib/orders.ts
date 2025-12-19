// lib/orders.ts
import pool from "@/lib/db";

export async function createOrderInDB() {
  const conn = await pool.getConnection();
  try {
    await conn.query(
      "INSERT INTO orders (status, created_at) VALUES ('pending', NOW())"
    );
  } finally {
    conn.release();
  }
}
