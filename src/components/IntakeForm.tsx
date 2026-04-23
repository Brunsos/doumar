"use client";

import { useState, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  intakeSchema,
  type IntakeSchemaType,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  MAX_TOTAL_SIZE,
  provinces,
  maritalStatusOptions,
} from "@/lib/validation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import DateInput from "@/components/DateInput";

const STEPS = ["Your Information", "Additional Details", "Documents & Submit"] as const;

const CONTACT_METHODS = ["Phone", "Text", "Email"] as const;

// Top-level fields to validate per step
const STEP_FIELDS: Record<number, (keyof IntakeSchemaType)[]> = {
  0: [
    "client",
    "maritalStatus",
    "spouse",
    "address",
    "maritalStatusChangeDate",
    "soldProperty",
    "propertySalePrice",
    "propertyPurchaseAmount",
    "propertyExpenses",
    "propertyPurchaseDate",
    "propertySaleDate",
  ],
  1: [
    "canadianCitizen",
    "authorizeElectionsCanada",
    "foreignPropertyOver100k",
    "children",
  ],
  2: ["consent", "additionalComments"],
};

export default function IntakeForm() {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [direction, setDirection] = useState(1);

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<IntakeSchemaType>({
    resolver: zodResolver(intakeSchema),
    mode: "onBlur",
    defaultValues: {
      client: {
        lastName: "",
        firstName: "",
        phone: "",
        email: "",
        dob: "",
        contactPreference: ["Phone"],
      },
      spouse: {
        lastName: "",
        firstName: "",
        phone: "",
        email: "",
        dob: "",
        contactPreference: [],
      },
      address: {
        street: "",
        city: "",
        province: "SK",
        postalCode: "",
      },
      maritalStatus: "Single",
      maritalStatusChangeDate: "",
      soldProperty: false,
      propertySalePrice: "",
      propertyPurchaseAmount: "",
      propertyExpenses: "",
      propertyPurchaseDate: "",
      propertySaleDate: "",
      canadianCitizen: true,
      authorizeElectionsCanada: false,
      foreignPropertyOver100k: false,
      children: [],
      additionalComments: "",
      consent: false as unknown as true,
    },
  });

  const { fields: childFields, append: addChild, remove: removeChild } = useFieldArray({
    control,
    name: "children",
  });

  const maritalStatus = watch("maritalStatus");
  const soldProperty = watch("soldProperty");
  const showSpouse = maritalStatus === "Married" || maritalStatus === "Common Law Spouse";

  // --- File handling ---

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError("");
    const selected = Array.from(e.target.files || []);

    for (const file of selected) {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setFileError(`"${file.name}" is not an accepted file type.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`"${file.name}" exceeds the 10 MB file size limit.`);
        return;
      }
    }

    const newFiles = [...files, ...selected];
    const totalSize = newFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      setFileError("Total file size exceeds 25 MB. Please remove some files.");
      return;
    }

    setFiles(newFiles);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileError("");
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  // --- Navigation ---

  async function goNext() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => s - 1);
  }

  // --- Submit ---

  async function onSubmit(data: IntakeSchemaType) {
    setStatus("submitting");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(data));

      const honeypotInput = document.querySelector<HTMLInputElement>('input[name="website"]');
      formData.append("website", honeypotInput?.value || "");

      for (const file of files) {
        formData.append("files", file);
      }

      const res = await fetch("/api/intake", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Submission failed.");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again or contact us directly."
      );
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-12">
        <div className="text-green-600 text-5xl mb-4">&#10003;</div>
        <h2 className="text-2xl font-semibold text-navy mb-4">
          Your information has been submitted.
        </h2>
        <p className="text-lg text-gray-700">
          We will contact you shortly to confirm receipt. If you have questions,
          call us at{" "}
          <a href="tel:306-205-4185" className="underline font-medium">
            306-205-4185
          </a>
          .
        </p>
      </div>
    );
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Honeypot */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label htmlFor="website">Website</label>
        <input type="text" name="website" id="website" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  i <= step
                    ? "bg-navy text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span
                className={`text-xs mt-1 text-center ${
                  i <= step ? "text-navy font-medium" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 mt-[-16px] ${
                  i < step ? "bg-navy" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {step === 0 && (
            <StepOne
              register={register}
              errors={errors}
              showSpouse={showSpouse}
              soldProperty={soldProperty}
              setValue={setValue}
              control={control}
            />
          )}
          {step === 1 && (
            <StepTwo
              register={register}
              errors={errors}
              control={control}
              childFields={childFields}
              addChild={addChild}
              removeChild={removeChild}
              setValue={setValue}
            />
          )}
          {step === 2 && (
            <StepThree
              register={register}
              errors={errors}
              files={files}
              fileError={fileError}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              removeFile={removeFile}
              formatFileSize={formatFileSize}
              status={status}
              errorMessage={errorMessage}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        {step > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="px-6 py-3 text-navy border-2 border-navy rounded font-medium hover:bg-navy-50 transition-colors"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="px-8 py-3 bg-navy text-white rounded font-semibold hover:bg-navy-light transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={status === "submitting"}
            className="px-8 py-3 bg-navy text-white rounded font-semibold hover:bg-navy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "submitting" ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>
    </form>
  );
}

// =============================================================================
// Step 1: Client Info, Spouse, Address, Marital Status, Property
// =============================================================================

type FormRegister = ReturnType<typeof useForm<IntakeSchemaType>>["register"];
type FormErrors = ReturnType<typeof useForm<IntakeSchemaType>>["formState"]["errors"];
type FormSetValue = ReturnType<typeof useForm<IntakeSchemaType>>["setValue"];
type FormControl = ReturnType<typeof useForm<IntakeSchemaType>>["control"];

function StepOne({
  register,
  errors,
  showSpouse,
  soldProperty,
  setValue,
  control,
}: {
  register: FormRegister;
  errors: FormErrors;
  showSpouse: boolean;
  soldProperty: boolean;
  setValue: FormSetValue;
  control: FormControl;
}) {
  return (
    <div className="space-y-8">
      {/* Client Info */}
      <fieldset>
        <legend className="text-xl font-semibold text-navy mb-4">Your Information</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Last Name" error={errors.client?.lastName?.message}>
            <input {...register("client.lastName")} className={inputClass(errors.client?.lastName)} />
          </Field>
          <Field label="First Name" error={errors.client?.firstName?.message}>
            <input {...register("client.firstName")} className={inputClass(errors.client?.firstName)} />
          </Field>
          <Field label="Contact Phone" error={errors.client?.phone?.message}>
            <input {...register("client.phone")} type="tel" className={inputClass(errors.client?.phone)} />
          </Field>
          <Field label="Contact Email" error={errors.client?.email?.message}>
            <input {...register("client.email")} type="email" className={inputClass(errors.client?.email)} />
          </Field>
          <Field label="Date of Birth" error={errors.client?.dob?.message}>
            <Controller
              control={control}
              name="client.dob"
              render={({ field }) => (
                <DateInput
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!errors.client?.dob}
                />
              )}
            />
          </Field>
          <Field
            label="Preferred Contact Method (select all that apply)"
            error={
              Array.isArray(errors.client?.contactPreference)
                ? undefined
                : errors.client?.contactPreference?.message
            }
          >
            <Controller
              control={control}
              name="client.contactPreference"
              render={({ field }) => (
                <ContactCheckboxGroup
                  value={field.value || []}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>
        </div>
      </fieldset>

      {/* Marital Status */}
      <fieldset>
        <legend className="text-xl font-semibold text-navy mb-4">Marital Status</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Status" error={errors.maritalStatus?.message}>
            <select {...register("maritalStatus")} className={inputClass(errors.maritalStatus)}>
              {maritalStatusOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </Field>
          <Field label="Date of change (if different from previous year)">
            <Controller
              control={control}
              name="maritalStatusChangeDate"
              render={({ field }) => (
                <DateInput
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  minYear={1970}
                />
              )}
            />
          </Field>
        </div>
      </fieldset>

      {/* Spouse (conditional) */}
      {showSpouse && (
        <fieldset>
          <legend className="text-xl font-semibold text-navy mb-4">Spouse Information</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Last Name" error={errors.spouse?.lastName?.message}>
              <input {...register("spouse.lastName")} className={inputClass(errors.spouse?.lastName)} />
            </Field>
            <Field label="First Name" error={errors.spouse?.firstName?.message}>
              <input {...register("spouse.firstName")} className={inputClass(errors.spouse?.firstName)} />
            </Field>
            <Field label="Contact Phone" error={errors.spouse?.phone?.message}>
              <input {...register("spouse.phone")} type="tel" className={inputClass(errors.spouse?.phone)} />
            </Field>
            <Field label="Contact Email" error={errors.spouse?.email?.message}>
              <input {...register("spouse.email")} type="email" className={inputClass(errors.spouse?.email)} />
            </Field>
            <Field label="Date of Birth" error={errors.spouse?.dob?.message}>
              <Controller
                control={control}
                name="spouse.dob"
                render={({ field }) => (
                  <DateInput
                    value={field.value || ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={!!errors.spouse?.dob}
                  />
                )}
              />
            </Field>
            <Field label="Preferred Contact Method (select all that apply)">
              <Controller
                control={control}
                name="spouse.contactPreference"
                render={({ field }) => (
                  <ContactCheckboxGroup
                    value={field.value || []}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>
          </div>
        </fieldset>
      )}

      {/* Address */}
      <fieldset>
        <legend className="text-xl font-semibold text-navy mb-4">Address</legend>
        <div className="space-y-4">
          <Field label="Street Address" error={errors.address?.street?.message}>
            <input {...register("address.street")} className={inputClass(errors.address?.street)} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="City" error={errors.address?.city?.message}>
              <input {...register("address.city")} className={inputClass(errors.address?.city)} />
            </Field>
            <Field label="Province" error={errors.address?.province?.message}>
              <select {...register("address.province")} className={inputClass(errors.address?.province)}>
                {provinces.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Postal Code" error={errors.address?.postalCode?.message}>
              <input {...register("address.postalCode")} placeholder="A1A 1A1" className={inputClass(errors.address?.postalCode)} />
            </Field>
          </div>
        </div>
      </fieldset>

      {/* Property Sale */}
      <fieldset>
        <legend className="text-xl font-semibold text-navy mb-4">Property</legend>
        <BooleanRadioField
          label="Have you sold property last year?"
          name="soldProperty"
          control={control}
          setValue={setValue}
        />

        {soldProperty && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Sale Price" error={errors.propertySalePrice?.message}>
                <input {...register("propertySalePrice")} placeholder="$" className={inputClass(errors.propertySalePrice)} />
              </Field>
              <Field label="Original Purchase Amount" error={errors.propertyPurchaseAmount?.message}>
                <input {...register("propertyPurchaseAmount")} placeholder="$" className={inputClass(errors.propertyPurchaseAmount)} />
              </Field>
              <Field label="Expenses" error={errors.propertyExpenses?.message}>
                <input {...register("propertyExpenses")} placeholder="$" className={inputClass(errors.propertyExpenses)} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Date of Purchase" error={errors.propertyPurchaseDate?.message}>
                <Controller
                  control={control}
                  name="propertyPurchaseDate"
                  render={({ field }) => (
                    <DateInput
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={!!errors.propertyPurchaseDate}
                      minYear={1950}
                    />
                  )}
                />
              </Field>
              <Field label="Date Sold" error={errors.propertySaleDate?.message}>
                <Controller
                  control={control}
                  name="propertySaleDate"
                  render={({ field }) => (
                    <DateInput
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={!!errors.propertySaleDate}
                      minYear={1950}
                    />
                  )}
                />
              </Field>
            </div>
          </div>
        )}
      </fieldset>
    </div>
  );
}

// =============================================================================
// Step 2: Citizenship, Elections, Foreign Property, Children
// =============================================================================

function StepTwo({
  register,
  errors,
  control,
  childFields,
  addChild,
  removeChild,
  setValue,
}: {
  register: FormRegister;
  errors: FormErrors;
  control: FormControl;
  childFields: { id: string }[];
  addChild: (value: { lastName: string; firstName: string; dob: string; gender: "M" | "F" }) => void;
  removeChild: (index: number) => void;
  setValue: FormSetValue;
}) {
  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="text-xl font-semibold text-navy mb-4">Additional Information</legend>
        <div className="space-y-4">
          <BooleanRadioField
            label="Do you have Canadian citizenship?"
            name="canadianCitizen"
            control={control}
            setValue={setValue}
          />
          <BooleanRadioField
            label="Do you authorize the CRA to give your information to Elections Canada?"
            name="authorizeElectionsCanada"
            control={control}
            setValue={setValue}
          />
          <BooleanRadioField
            label="Did you own or hold specified foreign property where the total cost was more than CAN$100,000?"
            name="foreignPropertyOver100k"
            control={control}
            setValue={setValue}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xl font-semibold text-navy mb-4">Family</legend>
        {childFields.map((field, index) => (
          <div key={field.id} className="border border-gray-200 rounded p-4 mb-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-navy">Child {index + 1}</span>
              <button
                type="button"
                onClick={() => removeChild(index)}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Last Name" error={errors.children?.[index]?.lastName?.message}>
                <input {...register(`children.${index}.lastName`)} className={inputClass(errors.children?.[index]?.lastName)} />
              </Field>
              <Field label="First Name" error={errors.children?.[index]?.firstName?.message}>
                <input {...register(`children.${index}.firstName`)} className={inputClass(errors.children?.[index]?.firstName)} />
              </Field>
              <Field label="Date of Birth" error={errors.children?.[index]?.dob?.message}>
                <Controller
                  control={control}
                  name={`children.${index}.dob`}
                  render={({ field }) => (
                    <DateInput
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={!!errors.children?.[index]?.dob}
                    />
                  )}
                />
              </Field>
              <Field label="Gender" error={errors.children?.[index]?.gender?.message}>
                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="M" {...register(`children.${index}.gender`)} className="w-4 h-4 accent-navy" />
                    <span>M</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="F" {...register(`children.${index}.gender`)} className="w-4 h-4 accent-navy" />
                    <span>F</span>
                  </label>
                </div>
              </Field>
            </div>
          </div>
        ))}

        {childFields.length < 3 && (
          <button
            type="button"
            onClick={() => addChild({ lastName: "", firstName: "", dob: "", gender: "M" })}
            className="text-navy font-medium hover:text-navy-light transition-colors"
          >
            + Add Child
          </button>
        )}

        {childFields.length === 0 && (
          <p className="text-gray-500 text-sm mt-2">No children added. Click above to add if applicable.</p>
        )}
      </fieldset>
    </div>
  );
}

// =============================================================================
// Step 3: File Upload, Additional Comments, Consent, Submit
// =============================================================================

function StepThree({
  register,
  errors,
  files,
  fileError,
  fileInputRef,
  handleFileChange,
  removeFile,
  formatFileSize,
  status,
  errorMessage,
}: {
  register: FormRegister;
  errors: FormErrors;
  files: File[];
  fileError: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
  formatFileSize: (bytes: number) => string;
  status: string;
  errorMessage: string;
}) {
  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div>
        <label className="block text-xl font-semibold text-navy mb-2">
          Upload Tax Documents
        </label>
        <p className="text-gray-600 mb-3 text-sm">
          Accepted formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX. Max 10 MB per
          file, 25 MB total.
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-block bg-gray-100 border-2 border-dashed border-gray-300 rounded px-6 py-4 text-lg text-navy font-medium hover:bg-gray-200 transition-colors cursor-pointer"
        >
          Choose Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_EXTENSIONS.join(",")}
          onChange={handleFileChange}
          className="hidden"
        />
        {fileError && (
          <p className="text-red-600 mt-2" role="alert">{fileError}</p>
        )}

        {files.length > 0 && (
          <ul className="mt-4 space-y-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-4 py-3"
              >
                <div>
                  <span className="font-medium">{file.name}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    ({formatFileSize(file.size)})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 font-medium text-sm ml-4"
                  aria-label={`Remove ${file.name}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Additional Comments */}
      <div>
        <label
          htmlFor="additionalComments"
          className="block text-xl font-semibold text-navy mb-2"
        >
          Additional Comments
        </label>
        <p className="text-gray-600 mb-3 text-sm">
          Anything else you&rsquo;d like us to know? Optional.
        </p>
        <textarea
          id="additionalComments"
          {...register("additionalComments")}
          rows={5}
          maxLength={2000}
          className={inputClass(errors.additionalComments)}
        />
        {errors.additionalComments && (
          <p className="text-red-600 mt-1 text-sm" role="alert">
            {errors.additionalComments.message}
          </p>
        )}
      </div>

      {/* Consent */}
      <div className="border border-gray-200 rounded p-4 bg-gray-50">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("consent")}
            className="mt-1 w-5 h-5 accent-navy"
          />
          <span className="text-base text-gray-700">
            I consent to submitting my personal information for the purpose of
            tax preparation. View our{" "}
            <Link href="/privacy" className="underline font-medium">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.consent && (
          <p className="text-red-600 mt-2 ml-8" role="alert">
            {errors.consent.message}
          </p>
        )}
      </div>

      {/* Security indicator */}
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        <span>
          Your information is transmitted securely using encryption. Files are
          sent directly to our team and are not stored on any server.
        </span>
      </div>

      {/* Error message */}
      {status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700" role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Shared UI helpers
// =============================================================================

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-navy mb-1">{label}</label>
      {children}
      {error && (
        <p className="text-red-600 text-sm mt-1" role="alert">{error}</p>
      )}
    </div>
  );
}

function ContactCheckboxGroup({
  value,
  onChange,
}: {
  value: ("Phone" | "Text" | "Email")[];
  onChange: (value: ("Phone" | "Text" | "Email")[]) => void;
}) {
  function toggle(option: "Phone" | "Text" | "Email") {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  }

  return (
    <div className="flex gap-4 pt-2 flex-wrap">
      {CONTACT_METHODS.map((opt) => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value.includes(opt)}
            onChange={() => toggle(opt)}
            className="w-4 h-4 accent-navy"
          />
          <span className="text-sm">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function BooleanRadioField({
  label,
  name,
  control,
  setValue,
}: {
  label: string;
  name: "soldProperty" | "canadianCitizen" | "authorizeElectionsCanada" | "foreignPropertyOver100k";
  control: FormControl;
  setValue: FormSetValue;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 border-b border-gray-100">
          <span className="text-gray-700">{label}</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={field.value === true}
                onChange={() => setValue(name, true)}
                className="w-4 h-4 accent-navy"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={field.value === false}
                onChange={() => setValue(name, false)}
                className="w-4 h-4 accent-navy"
              />
              <span>No</span>
            </label>
          </div>
        </div>
      )}
    />
  );
}

function inputClass(error?: { message?: string } | undefined): string {
  return `w-full border-2 rounded p-3 text-base focus:outline-none focus:border-navy transition-colors ${
    error ? "border-red-500" : "border-gray-300"
  }`;
}
