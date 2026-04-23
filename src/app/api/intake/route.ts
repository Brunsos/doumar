import { NextRequest, NextResponse } from "next/server";
import { intakeSchema, MAX_FILE_SIZE, MAX_TOTAL_SIZE } from "@/lib/validation";
import {
  validateFileMagicBytes,
  sanitizeFilename,
  checkHoneypot,
  anonymizeIp,
} from "@/lib/security";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendIntakeEmail } from "@/lib/email";
import { generateIntakePdf } from "@/lib/pdf";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const anonIp = anonymizeIp(ip);

  // Rate limiting
  const rateResult = checkRateLimit(ip);
  if (!rateResult.allowed) {
    console.log(`[intake] Rate limited: ${anonIp}`);
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateResult.retryAfterMs || 0) / 1000)),
        },
      }
    );
  }

  try {
    const formData = await request.formData();

    // Honeypot check
    const honeypot = formData.get("website") as string | null;
    if (checkHoneypot(honeypot)) {
      console.log(`[intake] Honeypot triggered: ${anonIp}`);
      return NextResponse.json({ success: true });
    }

    // Parse and validate form data
    const rawJson = formData.get("data") as string;
    if (!rawJson) {
      return NextResponse.json(
        { error: "Missing form data." },
        { status: 400 }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      return NextResponse.json(
        { error: "Invalid form data." },
        { status: 400 }
      );
    }

    const validation = intakeSchema.safeParse(parsed);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid form data.", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Process uploaded files
    const files: { filename: string; content: Buffer }[] = [];
    let totalSize = 0;

    const fileEntries = formData.getAll("files");
    for (const entry of fileEntries) {
      if (!(entry instanceof File) || entry.size === 0) continue;

      if (entry.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${entry.name}" exceeds the 10 MB limit.` },
          { status: 400 }
        );
      }

      totalSize += entry.size;
      if (totalSize > MAX_TOTAL_SIZE) {
        return NextResponse.json(
          { error: "Total file size exceeds the 25 MB limit." },
          { status: 400 }
        );
      }

      const arrayBuffer = await entry.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (!validateFileMagicBytes(buffer)) {
        return NextResponse.json(
          { error: `File "${entry.name}" is not an allowed file type.` },
          { status: 400 }
        );
      }

      files.push({
        filename: sanitizeFilename(entry.name),
        content: buffer,
      });
    }

    // Generate filled intake PDF
    const pdfBuffer = await generateIntakePdf(validation.data);

    // Send email via Resend
    await sendIntakeEmail({
      data: validation.data,
      pdfBuffer,
      files,
    });

    console.log(`[intake] Success: ${anonIp}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      `[intake] Error: ${anonIp}`,
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "An error occurred while processing your submission. Please try again or contact us directly." },
      { status: 500 }
    );
  }
}
