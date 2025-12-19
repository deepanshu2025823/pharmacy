// lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true, // SSL/TLS
  auth: {
    user: 'support@artomatic.in',
    pass: process.env.EMAIL_PASSWORD,
  },
  debug: true,
  logger: true,
});

type OrderEmailData = {
  orderId: number;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: string;
  oldStatus?: string;
  totalAmount: number;
  items: Array<{
    medicine_name: string;
    qty: number;
    price: number;
  }>;
  orderDate: string;
};

const statusMessages: Record<string, { title: string; message: string; color: string }> = {
  PENDING: {
    title: '⏳ Order Received',
    message: 'We have received your order and it is being reviewed.',
    color: '#f59e0b',
  },
  CONFIRMED: {
    title: '✅ Order Confirmed',
    message: 'Your order has been confirmed and will be processed shortly.',
    color: '#3b82f6',
  },
  PROCESSING: {
    title: '📦 Order Processing',
    message: 'Your medicines are being carefully prepared and packaged.',
    color: '#8b5cf6',
  },
  SHIPPED: {
    title: '🚚 Order Shipped',
    message: 'Your order is on its way! You will receive it soon.',
    color: '#6366f1',
  },
  DELIVERED: {
    title: '🎉 Order Delivered',
    message: 'Your order has been successfully delivered. Thank you for choosing us!',
    color: '#10b981',
  },
  CANCELLED: {
    title: '❌ Order Cancelled',
    message: 'Your order has been cancelled. If you have any questions, please contact us.',
    color: '#ef4444',
  },
};

function generateOrderEmailHTML(data: OrderEmailData): string {
  const statusInfo = statusMessages[data.status] || statusMessages.PENDING;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Update - ${data.orderId}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
        <tr>
          <td align="center">
            <!-- Main Container -->
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    🏥 Pharmacy Store
                  </h1>
                  <p style="margin: 10px 0 0 0; color: #e0f2fe; font-size: 14px;">
                    Your Trusted Healthcare Partner
                  </p>
                </td>
              </tr>

              <!-- Status Banner -->
              <tr>
                <td style="background-color: ${statusInfo.color}; padding: 20px 40px; text-align: center;">
                  <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                    ${statusInfo.title}
                  </h2>
                  <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.95;">
                    Order #${data.orderId}
                  </p>
                </td>
              </tr>

              <!-- Message -->
              <tr>
                <td style="padding: 30px 40px;">
                  <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                    Dear <strong>${data.customerName}</strong>,
                  </p>
                  <p style="margin: 15px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    ${statusInfo.message}
                  </p>
                </td>
              </tr>

              <!-- Order Details -->
              <tr>
                <td style="padding: 0 40px 30px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; overflow: hidden;">
                    <tr>
                      <td style="padding: 20px;">
                        <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 18px; font-weight: 600;">
                          📋 Order Summary
                        </h3>
                        
                        <!-- Order Info Grid -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Order ID:</td>
                            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">#${data.orderId}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Order Date:</td>
                            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${new Date(data.orderDate).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Status:</td>
                            <td style="padding: 8px 0;">
                              <span style="display: inline-block; background-color: ${statusInfo.color}; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                                ${data.status}
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Items List -->
              <tr>
                <td style="padding: 0 40px 30px 40px;">
                  <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 18px; font-weight: 600;">
                    💊 Order Items
                  </h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <thead>
                      <tr style="background-color: #f9fafb;">
                        <th style="padding: 12px 15px; text-align: left; color: #6b7280; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Medicine</th>
                        <th style="padding: 12px 15px; text-align: center; color: #6b7280; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Qty</th>
                        <th style="padding: 12px 15px; text-align: right; color: #6b7280; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${data.items.map((item, index) => `
                        <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                          <td style="padding: 12px 15px; color: #111827; font-size: 14px; border-bottom: ${index === data.items.length - 1 ? 'none' : '1px solid #e5e7eb'};">
                            ${item.medicine_name}
                          </td>
                          <td style="padding: 12px 15px; text-align: center; color: #6b7280; font-size: 14px; border-bottom: ${index === data.items.length - 1 ? 'none' : '1px solid #e5e7eb'};">
                            ${item.qty}
                          </td>
                          <td style="padding: 12px 15px; text-align: right; color: #111827; font-size: 14px; font-weight: 600; border-bottom: ${index === data.items.length - 1 ? 'none' : '1px solid #e5e7eb'};">
                            ₹${Number(item.price).toFixed(2)}
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                    <tfoot>
                      <tr style="background-color: #10b981;">
                        <td colspan="2" style="padding: 15px; text-align: right; color: #ffffff; font-size: 16px; font-weight: 700;">
                          Total Amount:
                        </td>
                        <td style="padding: 15px; text-align: right; color: #ffffff; font-size: 18px; font-weight: 700;">
                          ₹${Number(data.totalAmount).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </td>
              </tr>

              <!-- Delivery Address -->
              <tr>
                <td style="padding: 0 40px 30px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px;">
                    <tr>
                      <td style="padding: 20px;">
                        <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">
                          📍 Delivery Address
                        </h3>
                        <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                          <strong>${data.customerName}</strong><br>
                          ${data.phone}<br>
                          ${data.address}<br>
                          ${data.city}, ${data.state} - ${data.pincode}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Help Section -->
              <tr>
                <td style="padding: 0 40px 30px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 8px;">
                    <tr>
                      <td style="padding: 20px; text-align: center;">
                        <p style="margin: 0; color: #92400e; font-size: 14px;">
                          <strong>Need Help?</strong><br>
                          Contact us at <a href="mailto:support@artomatic.in" style="color: #10b981; text-decoration: none; font-weight: 600;">support@artomatic.in</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px;">
                    Thank you for choosing Pharmacy Store
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} Pharmacy Store. All rights reserved.<br>
                    This is an automated email. Please do not reply to this message.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function sendOrderStatusEmail(data: OrderEmailData) {
  try {
    // Validate email configuration
    if (!process.env.EMAIL_PASSWORD) {
      throw new Error('EMAIL_PASSWORD environment variable is not set');
    }

    const htmlContent = generateOrderEmailHTML(data);
    const statusInfo = statusMessages[data.status] || statusMessages.PENDING;

    console.log(`Attempting to send email to: ${data.customerEmail}`);
    console.log(`Email subject: ${statusInfo.title} - Order #${data.orderId}`);

    const info = await transporter.sendMail({
      from: {
        name: 'Pharmacy Store',
        address: 'support@artomatic.in'
      },
      to: data.customerEmail,
      subject: `${statusInfo.title} - Order #${data.orderId}`,
      html: htmlContent,
    });

    console.log('Email sent successfully:', info.messageId);
    console.log('Response:', info.response);

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Email sending error:', error);
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Error response:', error.response);
    }
    throw error;
  }
}

// Verify email configuration
export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    console.log('📧 Email from: support@artomatic.in');
    return true;
  } catch (error: any) {
    console.error('❌ Email configuration error:', error);
    console.error('Error details:', error.message);
    return false;
  }
}