import PageHeader from "@/components/PageHeader";
import { CONTACT } from "@/lib/constants";

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Email Us" />

      <div className="max-w-4xl mx-auto px-6 py-14">
        <div className="max-w-lg">
          <div className="space-y-6">
            <p className="text-xl">
              <a
                href={`mailto:${CONTACT.email}`}
                className="text-navy underline font-medium"
              >
                {CONTACT.email}
              </a>
            </p>
            <p className="text-xl">
              <a
                href={`tel:${CONTACT.phone}`}
                className="text-navy underline font-medium"
              >
                {CONTACT.phone}
              </a>
            </p>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-gray-100 text-gray-500 text-sm">
          <p>Dou-Mar Tax Services Ltd.</p>
          <p>{CONTACT.fullAddress}</p>
          <p>Tel. {CONTACT.phone}</p>
        </div>
      </div>
    </>
  );
}
