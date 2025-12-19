import { NextResponse } from "next/server";
import db from "@/lib/db";
import { emitAdminNotification } from "@/socket-server";

export async function POST(req: Request) {
  const { message, link } = await req.json();

  await db.query(
    "INSERT INTO notifications (message, link) VALUES (?, ?)",
    [message, link]
  );

  emitAdminNotification({ message, link });

  return NextResponse.json({ success: true });
}
