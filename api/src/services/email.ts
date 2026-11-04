import nodemailer, { Transporter } from 'nodemailer';

const emailFrom = process.env.EMAIL_FROM || 'noreply@sastaplots.com';
const resendApiKey = process.env.RESEND_API_KEY;
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

let transporter: Transporter | null = null;
let isConfigured = false;

// Initialize Transporter if credentials are present
try {
  if (resendApiKey) {
    transporter = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: resendApiKey,
      },
    });
    isConfigured = true;
    console.log('✅ Email service configured with Resend SMTP.');
  } else if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    isConfigured = true;
    console.log('✅ Email service configured with custom SMTP.');
  } else {
    console.log('ℹ️ Email service not configured (RESEND_API_KEY or SMTP_* unset). Operating in mock mode.');
  }
} catch (err) {
  console.warn('⚠️ Could not initialize email transporter:', err);
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Sends an email or mocks it to console if not configured
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const { to, subject, html, text } = options;

  if (!isConfigured || !transporter) {
    console.log(`[EMAIL MOCK] To: ${to} | Subject: "${subject}"`);
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: `Sasta Plots <${emailFrom}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html,
    });
    console.log(`[EMAIL SENT] To: ${to} | MessageId: ${info.messageId}`);
    return true;
  } catch (error: any) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error.message);
    // Graceful fallback: do not throw to prevent breaking request flow
    return false;
  }
}

/**
 * Sends notification when a property status changes
 */
export async function sendPropertyStatusEmail(
  to: string,
  ownerName: string,
  propertyTitle: string,
  status: string,
  feedback?: string
): Promise<void> {
  const isApproved = status === 'approved';
  const subject = isApproved
    ? `Your property "${propertyTitle}" has been approved!`
    : `Status update regarding your property "${propertyTitle}"`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a;">Sasta Plots</h2>
      <p>Hello <strong>${ownerName || 'Property Owner'}</strong>,</p>
      <p>Your property listing <strong>"${propertyTitle}"</strong> status has been updated to: <span style="font-weight: bold; text-transform: uppercase; color: ${isApproved ? '#16a34a' : '#ea580c'};">${status.replace('_', ' ')}</span>.</p>
      ${
        feedback
          ? `<div style="background-color: #f8fafc; padding: 12px; border-left: 4px solid #64748b; margin: 16px 0;">
              <strong>Feedback / Reason:</strong><br />${feedback}
            </div>`
          : ''
      }
      <p>You can view and manage your listing on your dashboard.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">This is an automated message from Sasta Plots Real Estate Marketplace.</p>
    </div>
  `;

  await sendEmail({ to, subject, html });
}

/**
 * Sends notification to property owner when an enquiry is received
 */
export async function sendEnquiryNotificationEmail(
  to: string,
  ownerName: string,
  propertyTitle: string,
  enquiry: {
    buyer_name: string;
    buyer_email: string;
    buyer_phone: string;
    message?: string | null;
  }
): Promise<void> {
  const subject = `New enquiry for "${propertyTitle}" from ${enquiry.buyer_name}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a;">Sasta Plots — New Lead</h2>
      <p>Hello <strong>${ownerName || 'Property Owner'}</strong>,</p>
      <p>You received a new enquiry on your listing <strong>"${propertyTitle}"</strong>.</p>
      <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Name:</strong> ${enquiry.buyer_name}</p>
        <p style="margin: 4px 0;"><strong>Phone:</strong> ${enquiry.buyer_phone}</p>
        <p style="margin: 4px 0;"><strong>Email:</strong> ${enquiry.buyer_email}</p>
        ${enquiry.message ? `<p style="margin: 4px 0;"><strong>Message:</strong><br />"${enquiry.message}"</p>` : ''}
      </div>
      <p>Log in to your Sasta Plots dashboard to respond to this lead directly.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">Sasta Plots Real Estate Marketplace</p>
    </div>
  `;

  await sendEmail({ to, subject, html });
}

/**
 * Sends response notification to buyer
 */
export async function sendEnquiryResponseEmail(
  to: string,
  buyerName: string,
  propertyTitle: string,
  response: string
): Promise<void> {
  const subject = `Update regarding your enquiry on "${propertyTitle}"`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a;">Sasta Plots</h2>
      <p>Hello <strong>${buyerName}</strong>,</p>
      <p>The seller has replied to your enquiry regarding <strong>"${propertyTitle}"</strong>:</p>
      <div style="background-color: #f8fafc; padding: 16px; border-left: 4px solid #0284c7; margin: 16px 0;">
        <p style="margin: 0; font-style: italic;">"${response}"</p>
      </div>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">Sasta Plots Real Estate Marketplace</p>
    </div>
  `;

  await sendEmail({ to, subject, html });
}
