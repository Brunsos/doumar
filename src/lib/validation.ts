import { z } from "zod";

// --- Reusable field schemas ---

const nameField = z
  .string()
  .min(1, "Required")
  .max(100, "Too long")
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Contains invalid characters");

const optionalNameField = z
  .string()
  .max(100, "Too long")
  .regex(/^[a-zA-ZÀ-ÿ\s'-]*$/, "Contains invalid characters")
  .optional()
  .or(z.literal(""));

const phoneField = z
  .string()
  .regex(/^[\d\s()+-]{7,20}$/, "Invalid phone number")
  .optional()
  .or(z.literal(""));

const emailField = z
  .string()
  .email("Invalid email")
  .optional()
  .or(z.literal(""));

const dobField = z
  .string()
  .min(1, "Required")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Select a date");

const optionalDobField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Select a date")
  .optional()
  .or(z.literal(""));

const contactPreference = z.enum(["Phone", "Text", "Email"]);

const maritalStatusOptions = [
  "Single",
  "Common Law Spouse",
  "Married",
  "Widowed",
  "Separated",
  "Divorced",
] as const;

const provinces = [
  "AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT",
] as const;

// --- Sub-schemas ---

const clientSchema = z.object({
  lastName: nameField,
  firstName: nameField,
  phone: phoneField,
  email: emailField,
  dob: dobField,
  contactPreference: contactPreference,
});

const spouseSchema = z.object({
  lastName: optionalNameField,
  firstName: optionalNameField,
  phone: phoneField,
  email: emailField,
  dob: optionalDobField,
  contactPreference: contactPreference.optional(),
});

const addressSchema = z.object({
  street: z.string().min(1, "Required").max(200, "Too long"),
  city: z.string().min(1, "Required").max(100, "Too long"),
  province: z.enum(provinces, { error: "Select a province" }),
  postalCode: z
    .string()
    .min(1, "Required")
    .regex(
      /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/,
      "Invalid postal code (e.g. S4S 6Y7)"
    ),
});

const childSchema = z.object({
  lastName: nameField,
  firstName: nameField,
  dob: dobField,
  gender: z.enum(["M", "F"], { error: "Select gender" }),
});

// --- Main intake schema ---

export const intakeSchema = z
  .object({
    client: clientSchema,
    spouse: spouseSchema.optional(),
    address: addressSchema,
    maritalStatus: z.enum(maritalStatusOptions, { error: "Select marital status" }),
    maritalStatusChangeDate: z.string().optional().or(z.literal("")),
    soldProperty: z.boolean(),
    propertySalePrice: z.string().optional().or(z.literal("")),
    propertyPurchaseAmount: z.string().optional().or(z.literal("")),
    propertyExpenses: z.string().optional().or(z.literal("")),
    canadianCitizen: z.boolean(),
    authorizeElectionsCanada: z.boolean(),
    foreignPropertyOver100k: z.boolean(),
    children: z.array(childSchema).max(3).optional(),
    consent: z.literal(true, {
      error: "You must consent to submit your information",
    }),
  })
  .superRefine((data, ctx) => {
    const needsSpouse =
      data.maritalStatus === "Married" || data.maritalStatus === "Common Law Spouse";

    if (needsSpouse && data.spouse) {
      if (!data.spouse.firstName || data.spouse.firstName.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Spouse first name is required",
          path: ["spouse", "firstName"],
        });
      }
      if (!data.spouse.lastName || data.spouse.lastName.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Spouse last name is required",
          path: ["spouse", "lastName"],
        });
      }
    }

    if (data.soldProperty) {
      if (!data.propertySalePrice || data.propertySalePrice.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sale price is required",
          path: ["propertySalePrice"],
        });
      }
      if (!data.propertyPurchaseAmount || data.propertyPurchaseAmount.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Original purchase amount is required",
          path: ["propertyPurchaseAmount"],
        });
      }
    }
  });

export type IntakeSchemaType = z.infer<typeof intakeSchema>;

export { provinces, maritalStatusOptions };

// --- File upload constants ---

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
