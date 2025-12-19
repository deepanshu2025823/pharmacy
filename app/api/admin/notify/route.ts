import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  const { message, link } = await req.json();

  const result = await db.query(
    "INSERT INTO notifications (message, link) VALUES (?, ?)",
    [message, link]
  );

  await fetch(
    "https://pharmacy-socket-server-production.up.railway.app/notify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        link,
      }),
    }
  );

  return NextResponse.json({
    success: true,
    id: result.insertId,
    message,
    link,
  });
}
