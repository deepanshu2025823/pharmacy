// app/api/notifications/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const connection = await pool.getConnection();

    try {
      const [notifications]: any = await connection.query(
        `SELECT id, message, link, created_at 
         FROM notifications 
         ORDER BY created_at DESC 
         LIMIT 10`
      );

      return NextResponse.json(notifications);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, link } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      const [result]: any = await connection.query(
        "INSERT INTO notifications (message, link) VALUES (?, ?)",
        [message, link || null]
      );

      return NextResponse.json(
        {
          id: result.insertId,
          message,
          link,
          created_at: new Date().toISOString(),
        },
        { status: 201 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}