// app/api/admin/orders/[id]/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRole } from "@/app/api/_utils/auth";
import { sendOrderStatusEmail } from "@/lib/email";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin", "staff"]);
    const { id } = await params;

    // Get order details
    const [orders]: any = await db.query(
      `
      SELECT 
        o.id,
        o.customer_id,
        c.name as customer_name,
        c.email as customer_email,
        c.phone,
        o.address,
        o.city,
        o.state,
        o.pincode,
        o.payment_method,
        o.payment_status,
        o.subtotal,
        o.delivery_fee,
        o.discount,
        o.total_amount,
        o.status,
        o.created_at
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ?
      `,
      [id]
    );

    if (orders.length === 0) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Get order items - first, let's check what columns exist in medicines table
    let items = [];
    try {
      // Try with different possible column names
      const [itemsResult]: any = await db.query(
        `
        SELECT 
          oi.id,
          oi.order_id,
          oi.medicine_id,
          oi.qty,
          oi.price,
          m.id as med_id,
          m.*
        FROM order_items oi
        LEFT JOIN medicines m ON oi.medicine_id = m.id
        WHERE oi.order_id = ?
        LIMIT 1
        `,
        [id]
      );

      // Check which column name exists for medicine name
      let medicineNameColumn = null;
      if (itemsResult.length > 0) {
        const columns = Object.keys(itemsResult[0]);
        if (columns.includes('medicine_name')) {
          medicineNameColumn = 'medicine_name';
        } else if (columns.includes('name')) {
          medicineNameColumn = 'name';
        } else if (columns.includes('title')) {
          medicineNameColumn = 'title';
        } else if (columns.includes('product_name')) {
          medicineNameColumn = 'product_name';
        }
      }

      // Now fetch all items with the correct column
      if (medicineNameColumn) {
        const [allItems]: any = await db.query(
          `
          SELECT 
            oi.id,
            oi.order_id,
            oi.medicine_id,
            oi.qty,
            oi.price,
            m.${medicineNameColumn} as medicine_name
          FROM order_items oi
          LEFT JOIN medicines m ON oi.medicine_id = m.id
          WHERE oi.order_id = ?
          `,
          [id]
        );
        items = allItems;
      } else {
        // If no name column found, just get items without names
        const [allItems]: any = await db.query(
          `
          SELECT 
            oi.id,
            oi.order_id,
            oi.medicine_id,
            oi.qty,
            oi.price,
            CONCAT('Medicine #', oi.medicine_id) as medicine_name
          FROM order_items oi
          WHERE oi.order_id = ?
          `,
          [id]
        );
        items = allItems;
      }
    } catch (itemError) {
      console.error("Error fetching items:", itemError);
      // Fallback: get items without medicine names
      const [allItems]: any = await db.query(
        `
        SELECT 
          oi.id,
          oi.order_id,
          oi.medicine_id,
          oi.qty,
          oi.price,
          CONCAT('Medicine #', oi.medicine_id) as medicine_name
        FROM order_items oi
        WHERE oi.order_id = ?
        `,
        [id]
      );
      items = allItems;
    }

    const orderDetails = {
      ...orders[0],
      items: items || [],
    };

    return NextResponse.json(orderDetails);
  } catch (e) {
    console.error("ORDER DETAILS GET ERROR", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { id } = await params;
    const { status, payment_status } = await req.json();

    // Get current order details before updating
    const [currentOrder]: any = await db.query(
      `
      SELECT 
        o.id,
        o.customer_id,
        o.status as old_status,
        o.payment_method,
        o.payment_status as old_payment_status,
        c.name as customer_name,
        c.email as customer_email,
        c.phone,
        o.address,
        o.city,
        o.state,
        o.pincode,
        o.total_amount,
        o.created_at
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ?
      `,
      [id]
    );

    if (currentOrder.length === 0) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let newStatus = status;
    let newPaymentStatus = payment_status;

    // Auto-update payment status based on order status for COD orders
    if (status && currentOrder[0].payment_method === 'COD') {
      if (status === 'DELIVERED') {
        newPaymentStatus = 'PAID';
      } else if (status === 'CANCELLED') {
        newPaymentStatus = 'FAILED';
      }
    }

    if (newStatus) {
      updates.push("status = ?");
      values.push(newStatus);
    }

    if (newPaymentStatus) {
      updates.push("payment_status = ?");
      values.push(newPaymentStatus);
    }

    if (updates.length === 0) {
      return NextResponse.json({ message: "No fields to update" }, { status: 400 });
    }

    values.push(id);

    // Update the order
    await db.query(
      `UPDATE orders SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    // Send email notification if status was changed and customer has email
    let emailSent = false;
    if (newStatus && currentOrder[0].customer_email) {
      try {
        console.log(`Attempting to send email to: ${currentOrder[0].customer_email}`);
        
        // Get order items for email
        let items = [];
        try {
          // Try to get items with medicine names
          const [itemsResult]: any = await db.query(
            `SELECT * FROM order_items WHERE order_id = ? LIMIT 1`,
            [id]
          );

          if (itemsResult.length > 0) {
            // Check medicines table structure
            const [medicineCheck]: any = await db.query(
              `SELECT * FROM medicines LIMIT 1`
            );

            let medicineNameColumn = null;
            if (medicineCheck.length > 0) {
              const columns = Object.keys(medicineCheck[0]);
              if (columns.includes('medicine_name')) {
                medicineNameColumn = 'medicine_name';
              } else if (columns.includes('name')) {
                medicineNameColumn = 'name';
              } else if (columns.includes('title')) {
                medicineNameColumn = 'title';
              } else if (columns.includes('product_name')) {
                medicineNameColumn = 'product_name';
              }
            }

            if (medicineNameColumn) {
              const [allItems]: any = await db.query(
                `
                SELECT 
                  oi.qty,
                  oi.price,
                  m.${medicineNameColumn} as medicine_name
                FROM order_items oi
                LEFT JOIN medicines m ON oi.medicine_id = m.id
                WHERE oi.order_id = ?
                `,
                [id]
              );
              items = allItems;
            } else {
              const [allItems]: any = await db.query(
                `
                SELECT 
                  oi.qty,
                  oi.price,
                  CONCAT('Medicine #', oi.medicine_id) as medicine_name
                FROM order_items oi
                WHERE oi.order_id = ?
                `,
                [id]
              );
              items = allItems;
            }
          }
        } catch (itemError) {
          console.error("Error fetching items for email:", itemError);
          const [allItems]: any = await db.query(
            `
            SELECT 
              oi.qty,
              oi.price,
              CONCAT('Medicine #', oi.medicine_id) as medicine_name
            FROM order_items oi
            WHERE oi.order_id = ?
            `,
            [id]
          );
          items = allItems;
        }

        const emailResult = await sendOrderStatusEmail({
          orderId: currentOrder[0].id,
          customerName: currentOrder[0].customer_name,
          customerEmail: currentOrder[0].customer_email,
          phone: currentOrder[0].phone,
          address: currentOrder[0].address,
          city: currentOrder[0].city,
          state: currentOrder[0].state,
          pincode: currentOrder[0].pincode,
          status: newStatus,
          oldStatus: currentOrder[0].old_status,
          totalAmount: currentOrder[0].total_amount,
          items: items || [],
          orderDate: currentOrder[0].created_at,
        });

        emailSent = emailResult.success;
        console.log(`Email sent successfully for order #${id} to ${currentOrder[0].customer_email}`);
      } catch (emailError: any) {
        console.error("Failed to send email:", emailError);
        console.error("Email error details:", emailError.message);
        emailSent = false;
      }
    }

    return NextResponse.json({ 
      success: true, 
      emailSent,
      message: emailSent 
        ? "Order status updated and email sent to customer!" 
        : currentOrder[0].customer_email 
          ? "Order status updated but email failed to send. Please check email configuration."
          : "Order status updated (no email on file for customer)"
    });
  } catch (e) {
    console.error("ORDER UPDATE ERROR", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { id } = await params;

    // Delete order items first (foreign key constraint)
    await db.query("DELETE FROM order_items WHERE order_id = ?", [id]);
    
    // Delete order
    await db.query("DELETE FROM orders WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("ORDER DELETE ERROR", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}