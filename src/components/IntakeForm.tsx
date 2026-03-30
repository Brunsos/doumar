"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { intakeSchema, type IntakeSchemaType, ALLOWED_EXTENSIONS, MAX_FILE_SIZE, MAX_TOTAL_SIZE } from "@/lib/validation";
import Link from "next/link";

export default function IntakeForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IntakeSchemaType>({
    resolver: zodResolver(intakeSchema),
    mode: "onBlur",
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError("");
    const selected = Array.from(e.target.files || []);

    // Validate extensions
    for (const file of selected) {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setFileError(`"${file.name}" is not an accepted file type. Accepted: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX.`);
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
    // Reset input so the same file can be re-added if removed
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

  async function onSubmit(data: IntakeSchemaType) {
    setStatus("submitting");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("consent", String(data.consent));
      // Honeypot — empty by default from the hidden field
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
          Your documents have been submitted.
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Honeypot - hidden from real users */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label htmlFor="website">Website</label>
        <input
          type="text"
          name="website"
          id="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* First Name */}
      <div>
        <label htmlFor="firstName" className="block text-lg font-medium text-navy mb-2">
          First Name
        </label>
        <input
          id="firstName"
          type="text"
          {...register("firstName")}
          className={`w-full border-2 rounded p-4 text-lg focus:outline-none focus:border-navy ${
            errors.firstName ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.firstName && (
          <p className="text-red-600 mt-1" role="alert">
            {errors.firstName.message}
          </p>
        )}
      </div>

      {/* Last Name */}
      <div>
        <label htmlFor="lastName" className="block text-lg font-medium text-navy mb-2">
          Last Name
        </label>
        <input
          id="lastName"
          type="text"
          {...register("lastName")}
          className={`w-full border-2 rounded p-4 text-lg focus:outline-none focus:border-navy ${
            errors.lastName ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.lastName && (
          <p className="text-red-600 mt-1" role="alert">
            {errors.lastName.message}
          </p>
        )}
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-lg font-medium text-navy mb-2">
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
          <p className="text-red-600 mt-2" role="alert">
            {fileError}
          </p>
        )}

        {/* File list */}
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

      {/* Security Trust Indicator */}
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

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full bg-navy text-white px-8 py-4 text-lg font-semibold rounded hover:bg-navy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Submitting..." : "Submit Documents"}
      </button>
    </form>
  );
}
