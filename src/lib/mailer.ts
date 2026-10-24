export async function sendPasswordResetEmail(email: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY;

  const rawBaseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'https://primebrew-herbis.vercel.app';
  const baseUrl = rawBaseUrl.startsWith('http') ? rawBaseUrl : `https://${rawBaseUrl}`;
  const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY is missing in environment variables.');
    return {
      success: false,
      message: 'RESEND_API_KEY is not configured in environment variables.',
    };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'PrimeBrew Herbis <noreply@primebrewherbis.com>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F8F5F0; margin: 0; padding: 20px; color: #2D3748; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 36px; border: 1px solid #B4D3EC; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
          .header { text-align: center; padding-bottom: 24px; border-bottom: 1px solid #edf2f7; }
          .logo-text { font-size: 24px; font-weight: 800; color: #3E5C76; text-transform: uppercase; letter-spacing: 1px; }
          .tagline { font-size: 12px; color: #5F86A8; font-weight: 600; }
          .content { padding: 28px 0; }
          .title { font-size: 20px; font-weight: 700; color: #3E5C76; margin-bottom: 12px; text-align: center; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { background-color: #3E5C76; color: #ffffff !important; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(62,92,118,0.25); }
          .link-box { background: #F8F5F0; padding: 12px; border-radius: 8px; font-size: 11px; word-break: break-all; color: #5F86A8; margin-top: 16px; }
          .footer { text-align: center; border-t: 1px solid #edf2f7; padding-top: 20px; font-size: 11px; color: #718096; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-text">PrimeBrew Herbis</div>
            <div class="tagline">Farm to Cup. Nature in Every Sip.</div>
          </div>
          <div class="content">
            <div class="title">Password Reset Verification Request</div>
            <p>Hello,</p>
            <p>We received a request to reset the password for your PrimeBrew Herbis customer account (<strong>${email}</strong>).</p>
            <p>Click the secure button below to set a new password for your account. This single-use link is valid for <strong>1 hour</strong>.</p>

            <div class="btn-container">
              <a href="${resetUrl}" target="_blank" class="btn">Reset My Password</a>
            </div>

            <p style="font-size: 12px; color: #718096;">If the button above does not work, copy and paste this verification URL directly into your web browser:</p>
            <div class="link-box">${resetUrl}</div>

            <p style="font-size: 12px; color: #e53e3e; margin-top: 24px;">If you did not initiate this password reset request, please disregard this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} PrimeBrew Herbis • Official Support: Contact.primebrew@gmail.com
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: '🔒 Reset Your PrimeBrew Herbis Password',
        html: htmlContent,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('❌ Resend API Error status:', res.status, data?.message || data?.name);
      return {
        success: false,
        message: data?.message || 'Failed to dispatch email via Resend API.',
      };
    }

    console.log('✅ Password reset email dispatched via Resend API. Email ID:', data.id);
    return {
      success: true,
      emailId: data.id,
    };
  } catch (error: any) {
    console.error('❌ Resend API Transport Error:', error?.message);
    return {
      success: false,
      message: error?.message || 'Error connecting to Resend email service.',
    };
  }
}

export async function sendContactReplyEmail(
  customerEmail: string,
  customerName: string,
  subject: string,
  replyMessage: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'PrimeBrew Herbis <noreply@primebrewherbis.com>';

  const emailSubject = subject.startsWith('Re:') ? subject : `Re: ${subject} - PrimeBrew Herbis`;

  const html = `
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
  `;

  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY missing. Contact reply email logged but not dispatched via network.');
    return { success: true, simulated: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [customerEmail],
        subject: emailSubject,
        html,
      }),
    });

    const data = await res.json();
    return { success: res.ok, emailId: data?.id };
  } catch (err: any) {
    console.error('Error sending reply via Resend:', err);
    return { success: false, message: err?.message };
  }
}
