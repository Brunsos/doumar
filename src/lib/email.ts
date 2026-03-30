import nodemailer from "nodemailer";
import { escapeHtml } from "./security";

interface IntakeEmailData {
  firstName: string;
  lastName: string;
  files: { filename: string; content: Buffer }[];
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });
}

export async function sendIntakeEmail(data: IntakeEmailData): Promise<void> {
  const transporter = createTransporter();

  // Verify TLS connection
  await transporter.verify();

  const safeFirst = escapeHtml(data.firstName);
  const safeLast = escapeHtml(data.lastName);

  const body = `
New Client Intake Submission
============================

Name: ${safeFirst} ${safeLast}

Number of documents attached: ${data.files.length}

---
This is an automated message from the Dou-Mar Tax Services website.
Files are sent directly and are not stored on any server.
Attachments have not been scanned for malware. Open only from trusted submissions.
  `.trim();

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.INTAKE_RECIPIENT,
    subject: `New Client Intake: ${safeFirst} ${safeLast}`,
    text: body,
    attachments: data.files.map((file) => ({
      filename: file.filename,
      content: file.content,
    })),
  });
}
