// Magic byte signatures for allowed file types
const FILE_SIGNATURES: { bytes: number[]; ext: string }[] = [
  { bytes: [0x25, 0x50, 0x44, 0x46], ext: "pdf" }, // %PDF
  { bytes: [0xff, 0xd8, 0xff], ext: "jpg" }, // JPEG
  { bytes: [0x89, 0x50, 0x4e, 0x47], ext: "png" }, // PNG
  { bytes: [0xd0, 0xcf, 0x11, 0xe0], ext: "doc" }, // DOC (OLE2)
  { bytes: [0x50, 0x4b, 0x03, 0x04], ext: "docx" }, // DOCX/XLSX (ZIP)
];

export function validateFileMagicBytes(buffer: Buffer): boolean {
  for (const sig of FILE_SIGNATURES) {
    if (sig.bytes.every((byte, i) => buffer[i] === byte)) {
      return true;
    }
  }
  return false;
}

export function sanitizeFilename(filename: string): string {
  // Remove path traversal
  let clean = filename.replace(/\.\.[/\\]/g, "").replace(/[/\\]/g, "");
  // Replace unsafe characters
  clean = clean.replace(/[^a-zA-Z0-9._-]/g, "_");
  // Truncate
  return clean.slice(0, 100);
}

export function checkHoneypot(value: string | null): boolean {
  // Returns true if honeypot is triggered (bot detected)
  return value !== null && value !== "";
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function anonymizeIp(ip: string): string {
  // Remove last octet for privacy
  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  }
  // IPv6 or unknown format
  return "unknown";
}
