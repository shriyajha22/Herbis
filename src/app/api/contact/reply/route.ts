import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { inMemoryStore } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { queryId, customerEmail, customerName, subject, replyMessage } = await request.json();

    if (!customerEmail || !replyMessage) {
      return NextResponse.json(
        { success: false, message: 'Customer email and reply message are required.' },
        { status: 400 }
      );
    }

    const gmailUser = process.env.GMAIL_USER || 'Contact.primebrew@gmail.com';
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (gmailPass) {
      // Create Nodemailer Transporter with Gmail SMTP
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      const mailOptions = {
        from: `"PrimeBrew Herbis Support" <${gmailUser}>`,
        to: customerEmail,
        subject: subject.startsWith('Re:') ? subject : `Re: ${subject} - PrimeBrew Herbis`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #1e3a29; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #0f2c1b; padding: 24px; text-align: center;">
              <h2 style="color: #d4af37; margin: 0; font-size: 22px;">PrimeBrew Herbis</h2>
              <p style="color: #f3f4f6; margin: 4px 0 0 0; font-size: 12px;">Customer Advisory & Wellness Support</p>
            </div>
            <div style="padding: 24px; background-color: #ffffff; line-height: 1.6; font-size: 14px;">
              <p>Dear <strong>${customerName || 'Valued Customer'}</strong>,</p>
              <p>Thank you for contacting PrimeBrew Herbis!</p>
              <div style="background-color: #f7faf7; border-left: 4px solid #1e3a29; padding: 16px; margin: 16px 0; border-radius: 4px;">
                <p style="margin: 0; white-space: pre-wrap; color: #2d3748;">${replyMessage}</p>
              </div>
              <p style="font-size: 12px; color: #718096; margin-top: 24px;">
                If you have any further questions, feel free to reply directly to this email or call us at <strong>+91 8377074324</strong>.
              </p>
            </div>
            <div style="background-color: #f8faf8; padding: 16px; text-align: center; border-top: 1px solid #edf2f7; font-size: 11px; color: #a0aec0;">
              PrimeBrew Herbis • H-No A 75, Ekta Vihar, Badarpur, New Delhi – 110044
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    // Update query status to Replied
    if (queryId) {
      const query = inMemoryStore.contactQueries.find((q) => q.id === queryId);
      if (query) {
        query.status = 'Replied';
      }
    }

    return NextResponse.json({
      success: true,
      message: gmailPass
        ? `Reply successfully emailed to ${customerEmail} via Gmail!`
        : `Reply recorded! (To send automated backend emails, set GMAIL_APP_PASSWORD in environment variables).`,
      queries: inMemoryStore.contactQueries,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to dispatch email reply' },
      { status: 500 }
    );
  }
}
