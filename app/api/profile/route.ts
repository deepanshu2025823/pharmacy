import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

// GET /api/profile?customerId=1
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get("customerId");

    if (!idStr) {
      return new NextResponse("Missing customerId", { status: 400 });
    }

    const id = Number(idStr);
    if (!id || Number.isNaN(id)) {
      return new NextResponse("Invalid customerId", { status: 400 });
    }

    const [rows] = (await db.query(
      `
      SELECT id, name, email, phone, address, city, pincode, created_at
      FROM customers
      WHERE id = ?
      LIMIT 1
    `,
      [id]
    )) as any as [
      {
        id: number;
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        pincode: string;
        created_at: string;
      }[]
    ];

    if (!rows || rows.length === 0) {
      return new NextResponse("Customer not found", { status: 404 });
    }

    return NextResponse.json({ profile: rows[0] });
  } catch (err) {
    console.error("PROFILE GET ERROR:", err);
    return new NextResponse("Server error while loading profile", {
      status: 500,
    });
  }
}

// PUT /api/profile  -> update basic details
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, email, phone, address, city, pincode } = body;

    if (!id || !name || !email || !phone || !address || !city || !pincode) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    await db.query(
      `
      UPDATE customers
      SET name = ?, email = ?, phone = ?, address = ?, city = ?, pincode = ?
      WHERE id = ?
    `,
      [name, email, phone, address, city, pincode, id]
    );

    const [rows] = (await db.query(
      `
      SELECT id, name, email, phone, address, city, pincode, created_at
      FROM customers
      WHERE id = ?
      LIMIT 1
    `,
      [id]
    )) as any as [any[]];

    return NextResponse.json({ profile: rows[0] });
  } catch (err) {
    console.error("PROFILE PUT ERROR:", err);
    return new NextResponse("Server error while updating profile", {
      status: 500,
    });
  }
}

// PATCH /api/profile  -> change password
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, currentPassword, newPassword } = body;

    if (!id || !currentPassword || !newPassword) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const [rows] = (await db.query(
      `SELECT password_hash FROM customers WHERE id = ? LIMIT 1`,
      [id]
    )) as any as [
      {
        password_hash: string;
      }[]
    ];

    if (!rows || rows.length === 0) {
      return new NextResponse("Customer not found", { status: 404 });
    }

    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) {
      return new NextResponse("Current password is incorrect", {
        status: 400,
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await db.query(
      `UPDATE customers SET password_hash = ? WHERE id = ?`,
      [newHash, id]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PROFILE PATCH ERROR:", err);
    return new NextResponse("Server error while changing password", {
      status: 500,
    });
  }
}
