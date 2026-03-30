import PageHeader from "@/components/PageHeader";
import IntakeForm from "@/components/IntakeForm";

export default function IntakePage() {
  return (
    <>
      <PageHeader
        title="Submit Your Documents"
        subtitle="Fill in your information and upload your tax documents below. We will contact you to confirm receipt."
      />

      <div className="max-w-2xl mx-auto px-6 py-14">
        <IntakeForm />

        <div className="mt-14 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-500 font-light text-lg">
            Prefer to call? Reach us at{" "}
            <a href="tel:306-205-4185" className="underline font-medium text-navy">
              306-205-4185
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
