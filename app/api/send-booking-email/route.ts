// app/api/send-booking-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { recipientEmail, bookingDetails } = await req.json();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      port: 465,
      secure: true,
      auth: {
        user: 'inventoryiitbbs@gmail.com',
        pass: 'oouz rjfb gycz hqbt',
        //lbwg cyuz kaji wvzd - secyweb
        //wtoq jljb xiza duhi - biswacp
      },
    });

    const mailOptions = {
      from: '"InventoryIITBBS" <noreply@inventoryiitbbs.com>',
      to: recipientEmail,
      subject: 'New Booking Request',
      html: `
        <body style="font-family: 'Inter', sans-serif; background-color: #eef2f7; color: #333; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 60px auto; padding: 40px; background-color: #fff; border-radius: 12px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);">
        <table bgcolor="#f6f9fc" style="padding:15px; width:100%; border-collapse: collapse; border-radius: 12px;">
            <tr>
                <td align="center">
                    <img style="width: 100%; max-width: 600px; height: auto; border-radius: 12px;" src="https://cloud.appwrite.io/v1/storage/buckets/6702651e002bf8d7a567/files/6704c508000d4a77fb52/view?project=67025fda0015f268c129" alt="Logo" />

                </td>
            </tr>
        </table>
        
        <h2 style="text-align: center; color: #333;">Booking Request Approval</h2>
        <p style="text-align: center; color: #666; margin: 0 0 24px;">Hello, there's a new booking request awaiting your approval:</p>
        
        <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 24px;">
        
            <tr>
                <td style="background-color: #f6f9fc; padding: 12px; border: 1px solid #e0e4e8; font-weight: bold; border-top-left-radius: 12px;">Requester:</td>
                <td style="background-color: #f6f9fc; padding: 12px; border: 1px solid #e0e4e8; border-top-right-radius: 12px;">${bookingDetails.requesterName}</td>
            </tr>
            <tr>
                <td style="background-color: #f6f9fc; padding: 12px; border: 1px solid #e0e4e8; font-weight: bold; border-top-left-radius: 12px;">Item:</td>
                <td style="background-color: #f6f9fc; padding: 12px; border: 1px solid #e0e4e8; border-top-right-radius: 12px;">${bookingDetails.itemName}</td>
            </tr>
            <tr>
                <td style="background-color: #ffffff; padding: 12px; border-left: 1px solid #e0e4e8; border-right: 1px solid #e0e4e8; font-weight: bold;">Quantity:</td>
                <td style="background-color: #ffffff; padding: 12px; border-left: 1px solid #e0e4e8; border-right: 1px solid #e0e4e8;">${bookingDetails.bookedQuantity}</td>
            </tr>
            <tr>
                <td style="background-color: #f6f9fc; padding: 12px; border: 1px solid #e0e4e8; font-weight: bold; border-bottom-left-radius: 12px;">Purpose:</td>
                <td style="background-color: #f6f9fc; padding: 12px; border: 1px solid #e0e4e8; border-bottom-right-radius: 12px;">${bookingDetails.purpose}</td>
            </tr>
        </table>
        
        <div style="text-align: center; margin: 24px 0;">
            <a href="${bookingDetails.approveLink}" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: #ffffff; text-decoration: none; border-radius: 8px; margin-right: 8px;">Approve</a>
            <a href="${bookingDetails.rejectLink}" style="display: inline-block; padding: 12px 24px; background-color: #e84545; color: #ffffff; text-decoration: none; border-radius: 8px;">Reject</a>
        </div>
        
        <p style="text-align: center; color: #999; font-size: 12px;">You are receiving this email because you are part of the booking approval team.</p>
    </div>
</body>

      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Error sending email' }, { status: 500 });
  }
}
