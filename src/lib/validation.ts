import { z } from "zod";

export const intakeSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name is too long")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "First name contains invalid characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name is too long")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Last name contains invalid characters"),
  consent: z.literal(true, {
    error: "You must consent to submit your information",
  }),
});

export type IntakeSchemaType = z.infer<typeof intakeSchema>;

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file
export const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25 MB total
