import PageHeader from "@/components/PageHeader";
import { PRICING, CONTACT } from "@/lib/constants";
import Link from "next/link";

export default function PricesPage() {
  return (
    <>
      <PageHeader title="Prices" />

      <div className="max-w-4xl mx-auto px-6 py-14">
        <p className="text-lg font-light text-gray-700 mb-10">
          {PRICING.intro}
        </p>

        {/* Base Price */}
        <div className="border-l-4 border-navy pl-6 py-4 mb-10">
          <p className="text-2xl text-navy">
            <span className="font-medium">{PRICING.baseService}</span>{" "}
            <span className="text-3xl font-semibold">{PRICING.basePrice}</span>{" "}
            <span className="text-gray-500 text-lg">{PRICING.basePriceNote}.</span>
          </p>
        </div>

        {/* Additional Services */}
        <p className="text-lg font-light text-gray-700 mb-4">
          {PRICING.additionalLabel}
        </p>
        <ul className="space-y-3 mb-10">
          {PRICING.additionalServices.map((service) => (
            <li
              key={service}
              className="text-gray-700 text-lg font-light flex items-start gap-3"
            >
              <span className="text-navy mt-1.5 text-xs">&#9679;</span>
              {service}
            </li>
          ))}
        </ul>

        <p className="text-lg font-medium text-navy">
          {PRICING.note}
        </p>

        {/* CTA */}
        <div className="mt-14 pt-10 border-t border-gray-100 text-center">
          <Link
            href="/intake"
            className="inline-block bg-navy text-white px-8 py-3.5 text-base font-medium rounded hover:bg-navy-light transition-colors no-underline"
          >
            Submit Your Documents
          </Link>
        </div>

        {/* Footer contact */}
        <div className="mt-14 pt-8 border-t border-gray-100 text-gray-500 text-sm">
          <p>Dou-Mar Tax Services Ltd.</p>
          <p>{CONTACT.fullAddress}</p>
          <p>Tel. {CONTACT.phone}</p>
        </div>
      </div>
    </>
  );
}
