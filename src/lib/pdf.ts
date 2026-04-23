import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { IntakeSchemaType } from "./validation";

const NAVY = rgb(0.1, 0.15, 0.3);
const BLACK = rgb(0, 0, 0);
const GRAY = rgb(0.4, 0.4, 0.4);
const LIGHT_GRAY = rgb(0.85, 0.85, 0.85);

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

export async function generateIntakePdf(
  data: IntakeSchemaType
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // --- Page 1 ---
  const page1 = pdfDoc.addPage([612, 792]); // US Letter
  let y = 750;
  const leftMargin = 50;
  const pageWidth = 612;

  // Header
  page1.drawText("DOU-MAR TAX SERVICES LTD.", {
    x: leftMargin,
    y,
    size: 16,
    font: bold,
    color: NAVY,
  });
  y -= 16;
  page1.drawText("177 Sunset Drive, Regina, SK  S4S 6Y7  |  306-205-4185", {
    x: leftMargin,
    y,
    size: 8,
    font,
    color: GRAY,
  });
  y -= 24;

  // Title bar
  page1.drawRectangle({
    x: leftMargin,
    y: y - 4,
    width: pageWidth - leftMargin * 2,
    height: 20,
    color: NAVY,
  });
  page1.drawText("Client Information", {
    x: leftMargin + 10,
    y: y + 1,
    size: 12,
    font: bold,
    color: rgb(1, 1, 1),
  });
  y -= 30;

  // --- Client Info ---
  y = drawSectionHeader(page1, "Client", leftMargin, y, bold);
  y = drawLabelValue(page1, "Last Name", data.client.lastName, leftMargin, y, font, bold);
  y = drawLabelValue(page1, "First Name", data.client.firstName, leftMargin, y, font, bold);
  y = drawLabelValue(page1, "Contact Phone", data.client.phone || "—", leftMargin, y, font, bold);
  y = drawLabelValue(page1, "Contact Email", data.client.email || "—", leftMargin, y, font, bold);
  y = drawLabelValue(page1, "Date of Birth", formatDate(data.client.dob), leftMargin, y, font, bold);
  y = drawLabelValue(
    page1,
    "Contact me by",
    formatContactPreference(data.client.contactPreference),
    leftMargin,
    y,
    font,
    bold,
  );

  // --- Spouse Info ---
  const needsSpouse =
    data.maritalStatus === "Married" || data.maritalStatus === "Common Law Spouse";

  if (needsSpouse && data.spouse) {
    y -= 8;
    y = drawSectionHeader(page1, "Spouse", leftMargin, y, bold);
    y = drawLabelValue(page1, "Last Name", data.spouse.lastName || "—", leftMargin, y, font, bold);
    y = drawLabelValue(page1, "First Name", data.spouse.firstName || "—", leftMargin, y, font, bold);
    y = drawLabelValue(page1, "Contact Phone", data.spouse.phone || "—", leftMargin, y, font, bold);
    y = drawLabelValue(page1, "Contact Email", data.spouse.email || "—", leftMargin, y, font, bold);
    y = drawLabelValue(page1, "Date of Birth", formatDate(data.spouse.dob || ""), leftMargin, y, font, bold);
    y = drawLabelValue(
      page1,
      "Contact me by",
      formatContactPreference(data.spouse.contactPreference),
      leftMargin,
      y,
      font,
      bold
    );
  }

  // --- Address ---
  y -= 8;
  y = drawSectionHeader(page1, "Address", leftMargin, y, bold);
  y = drawLabelValue(page1, "Street", data.address.street, leftMargin, y, font, bold);

  // City / Province / Postal on one conceptual row
  y = drawLabelValue(page1, "City", data.address.city, leftMargin, y, font, bold);
  y = drawLabelValue(page1, "Province", data.address.province, leftMargin, y, font, bold);
  y = drawLabelValue(page1, "Postal Code", data.address.postalCode, leftMargin, y, font, bold);

  // --- Marital Status ---
  y -= 8;
  y = drawSectionHeader(page1, "Marital Status", leftMargin, y, bold);
  y = drawLabelValue(page1, "Status", data.maritalStatus, leftMargin, y, font, bold);
  if (data.maritalStatusChangeDate) {
    y = drawLabelValue(
      page1,
      "Date of change",
      data.maritalStatusChangeDate,
      leftMargin,
      y,
      font,
      bold
    );
  }

  // --- Property Sale ---
  y -= 8;
  y = drawLabelValue(
    page1,
    "Sold property last year?",
    data.soldProperty ? "Yes" : "No",
    leftMargin,
    y,
    font,
    bold
  );
  if (data.soldProperty) {
    y = drawLabelValue(page1, "Date of purchase", formatDate(data.propertyPurchaseDate || ""), leftMargin, y, font, bold);
    y = drawLabelValue(page1, "Date sold", formatDate(data.propertySaleDate || ""), leftMargin, y, font, bold);
    y = drawLabelValue(page1, "Sale price", data.propertySalePrice || "—", leftMargin, y, font, bold);
    y = drawLabelValue(
      page1,
      "Original purchase amount",
      data.propertyPurchaseAmount || "—",
      leftMargin,
      y,
      font,
      bold
    );
    y = drawLabelValue(page1, "Expenses", data.propertyExpenses || "—", leftMargin, y, font, bold);
  }

  // --- Page 2 ---
  const page2 = pdfDoc.addPage([612, 792]);
  y = 750;

  // Title bar
  page2.drawRectangle({
    x: leftMargin,
    y: y - 4,
    width: pageWidth - leftMargin * 2,
    height: 20,
    color: NAVY,
  });
  page2.drawText("Client Information (continued)", {
    x: leftMargin + 10,
    y: y + 1,
    size: 12,
    font: bold,
    color: rgb(1, 1, 1),
  });
  y -= 30;

  // --- Additional Information ---
  y = drawSectionHeader(page2, "Additional Information", leftMargin, y, bold);
  y = drawLabelValue(
    page2,
    "Canadian citizenship?",
    data.canadianCitizen ? "Yes" : "No",
    leftMargin,
    y,
    font,
    bold
  );
  y = drawLabelValue(
    page2,
    "Authorize CRA / Elections Canada?",
    data.authorizeElectionsCanada ? "Yes" : "No",
    leftMargin,
    y,
    font,
    bold
  );
  y = drawLabelValue(
    page2,
    "Foreign property > CAN$100,000?",
    data.foreignPropertyOver100k ? "Yes" : "No",
    leftMargin,
    y,
    font,
    bold
  );

  // --- Children ---
  const children = data.children || [];
  if (children.length > 0) {
    y -= 8;
    y = drawSectionHeader(page2, "Family", leftMargin, y, bold);

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      y -= 4;
      page2.drawText(`Child ${i + 1}:`, {
        x: leftMargin,
        y,
        size: 10,
        font: bold,
        color: NAVY,
      });
      y -= 16;
      y = drawLabelValue(page2, "Last Name", child.lastName, leftMargin, y, font, bold);
      y = drawLabelValue(page2, "First Name", child.firstName, leftMargin, y, font, bold);
      y = drawLabelValue(page2, "Date of Birth", formatDate(child.dob), leftMargin, y, font, bold);
      y = drawLabelValue(page2, "Gender", child.gender, leftMargin, y, font, bold);
    }
  }

  // --- Additional Comments ---
  if (data.additionalComments && data.additionalComments.trim() !== "") {
    y -= 8;
    y = drawSectionHeader(page2, "Additional Comments", leftMargin, y, bold);
    const contentWidth = pageWidth - leftMargin * 2 - 20;
    const lines = wrapText(
      data.additionalComments.trim(),
      font,
      10,
      contentWidth,
    );
    for (const line of lines) {
      if (y < 60) break;
      page2.drawText(line, {
        x: leftMargin + 10,
        y,
        size: 10,
        font,
        color: BLACK,
      });
      y -= 14;
    }
  }

  // --- Footer on both pages ---
  const footerText = "Generated from doumar.ca online intake form";
  for (const page of [page1, page2]) {
    page.drawText(footerText, {
      x: leftMargin,
      y: 30,
      size: 7,
      font,
      color: GRAY,
    });
  }

  return pdfDoc.save();
}

// --- Drawing helpers ---

function drawSectionHeader(
  page: ReturnType<PDFDocument["addPage"]>,
  title: string,
  x: number,
  y: number,
  bold: Awaited<ReturnType<PDFDocument["embedFont"]>>
): number {
  page.drawRectangle({
    x,
    y: y - 4,
    width: 512,
    height: 18,
    color: LIGHT_GRAY,
  });
  page.drawText(title, {
    x: x + 6,
    y: y,
    size: 11,
    font: bold,
    color: NAVY,
  });
  return y - 22;
}

function drawLabelValue(
  page: ReturnType<PDFDocument["addPage"]>,
  label: string,
  value: string,
  x: number,
  y: number,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  bold: Awaited<ReturnType<PDFDocument["embedFont"]>>
): number {
  page.drawText(label + ":", {
    x: x + 10,
    y,
    size: 9,
    font: bold,
    color: GRAY,
  });
  page.drawText(value, {
    x: x + 180,
    y,
    size: 10,
    font,
    color: BLACK,
  });
  return y - 16;
}

function wrapText(
  text: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  size: number,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    if (paragraph === "") {
      lines.push("");
      continue;
    }
    const words = paragraph.split(/\s+/);
    let current = "";
    for (const word of words) {
      const candidate = current ? current + " " + word : word;
      const width = font.widthOfTextAtSize(candidate, size);
      if (width <= maxWidth) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}
