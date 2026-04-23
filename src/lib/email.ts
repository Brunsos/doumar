import { Resend } from "resend";
import type { IntakeSchemaType } from "./validation";

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

function formatContactPreference(
  value: ("Phone" | "Text" | "Email")[] | undefined,
): string {
  if (!value || value.length === 0) return "—";
  return value.join(", ");
}

// Names passed the nameField regex (letters, spaces, apostrophes, hyphens
// only), which is already safe for filesystem use on Windows, macOS, and
// Linux. No further sanitization needed.
function buildIntakeName(data: IntakeSchemaType): string {
  const last = data.client.lastName.trim();
  const first = data.client.firstName.trim();
  return `${last} ${first} Client Intake`;
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

interface IntakeEmailData {
  data: IntakeSchemaType;
  pdfBuffer: Uint8Array;
  files: { filename: string; content: Buffer }[];
}

export async function sendIntakeEmail(input: IntakeEmailData): Promise<void> {
  const intakeName = buildIntakeName(input.data);
  const body = buildEmailBody(input.data);

  const attachments = [
    {
      filename: `${intakeName}.pdf`,
      content: Buffer.from(input.pdfBuffer).toString("base64"),
    },
    ...input.files.map((file) => ({
      filename: file.filename,
      content: file.content.toString("base64"),
    })),
  ];

  const resend = getResend();

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "Dou-Mar Intake <onboarding@resend.dev>",
    to: process.env.INTAKE_RECIPIENT!,
    subject: intakeName,
    text: body,
    attachments,
  });
}

function buildEmailBody(data: IntakeSchemaType): string {
  const lines: string[] = [
    "New Client Intake Submission",
    "============================",
    "",
    "CLIENT INFORMATION",
    `  Name: ${data.client.firstName} ${data.client.lastName}`,
    `  Phone: ${data.client.phone || "—"}`,
    `  Email: ${data.client.email || "—"}`,
    `  Date of Birth: ${formatDate(data.client.dob)}`,
    `  Preferred Contact: ${formatContactPreference(data.client.contactPreference)}`,
    "",
  ];

  const needsSpouse =
    data.maritalStatus === "Married" || data.maritalStatus === "Common Law Spouse";

  if (needsSpouse && data.spouse) {
    lines.push(
      "SPOUSE INFORMATION",
      `  Name: ${data.spouse.firstName || "—"} ${data.spouse.lastName || "—"}`,
      `  Phone: ${data.spouse.phone || "—"}`,
      `  Email: ${data.spouse.email || "—"}`,
      `  Date of Birth: ${formatDate(data.spouse.dob || "")}`,
      `  Preferred Contact: ${formatContactPreference(data.spouse.contactPreference)}`,
      "",
    );
  }

  lines.push(
    "ADDRESS",
    `  ${data.address.street}`,
    `  ${data.address.city}, ${data.address.province}  ${data.address.postalCode}`,
    "",
    "MARITAL STATUS",
    `  ${data.maritalStatus}`,
  );
  if (data.maritalStatusChangeDate) {
    lines.push(`  Date of change: ${formatDate(data.maritalStatusChangeDate)}`);
  }
  lines.push("");

  lines.push(`SOLD PROPERTY LAST YEAR: ${data.soldProperty ? "Yes" : "No"}`);
  if (data.soldProperty) {
    lines.push(
      `  Date of purchase: ${formatDate(data.propertyPurchaseDate || "")}`,
      `  Date sold: ${formatDate(data.propertySaleDate || "")}`,
      `  Sale price: ${data.propertySalePrice || "—"}`,
      `  Original purchase amount: ${data.propertyPurchaseAmount || "—"}`,
      `  Expenses: ${data.propertyExpenses || "—"}`,
    );
  }
  lines.push("");

  lines.push(
    "ADDITIONAL INFORMATION",
    `  Canadian citizen: ${data.canadianCitizen ? "Yes" : "No"}`,
    `  Authorize Elections Canada: ${data.authorizeElectionsCanada ? "Yes" : "No"}`,
    `  Foreign property > $100,000: ${data.foreignPropertyOver100k ? "Yes" : "No"}`,
    "",
  );

  const children = data.children || [];
  if (children.length > 0) {
    lines.push("CHILDREN");
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      lines.push(
        `  Child ${i + 1}: ${child.firstName} ${child.lastName}, DOB: ${formatDate(child.dob)}, Gender: ${child.gender}`,
      );
    }
    lines.push("");
  }

  if (data.additionalComments && data.additionalComments.trim() !== "") {
    lines.push("ADDITIONAL COMMENTS", data.additionalComments.trim(), "");
  }

  lines.push(
    "---",
    "This is an automated message from the Dou-Mar Tax Services website.",
    "A filled intake PDF is attached. Additional uploaded documents may also be attached.",
    "Attachments have not been scanned for malware. Open only from trusted submissions.",
  );

  return lines.join("\n");
}
