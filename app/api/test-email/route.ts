// app/api/test-email/route.ts
import { NextResponse } from "next/server";
import { verifyEmailConfig } from "@/lib/email";

export async function GET() {
  const isConfigured = await verifyEmailConfig();
  return NextResponse.json({ 
    configured: isConfigured,
    message: isConfigured ? "Email server is ready" : "Email configuration failed"
  });
}