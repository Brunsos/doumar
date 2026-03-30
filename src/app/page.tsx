import Link from "next/link";
import { SERVICES, CONTACT } from "@/lib/constants";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20 md:py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
            Dou-Mar Tax Services Ltd.
          </h1>
          <div className="w-16 h-px bg-white/30 mx-auto my-6" />
          <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto leading-relaxed">
            Professional personal income tax preparation serving Saskatchewan
            residents since 1989
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/intake"
              className="inline-block bg-white text-navy px-8 py-3.5 text-base font-medium rounded no-underline hover:bg-gray-100 transition-colors"
            >
              Submit Your Documents
            </Link>
            <Link
              href="/contact"
              className="inline-block border-2 border-white text-white px-8 py-3.5 text-base font-medium rounded no-underline hover:bg-white hover:text-navy transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Offers heading */}
      <section className="pt-16 md:pt-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-light text-navy tracking-tight text-center mb-2">
            Offers
          </h2>
          <div className="w-12 h-px bg-navy/20 mx-auto" />
        </div>
      </section>

      {/* Computerized Returns */}
      <section className="py-12 md:py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl md:text-2xl font-light text-navy mb-5 tracking-tight">
            {SERVICES.computerizedReturns.title}
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg font-light">
            {SERVICES.computerizedReturns.body}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        <hr className="border-gray-100" />
      </div>

      {/* Efile Service */}
      <section className="py-12 md:py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl md:text-2xl font-light text-navy mb-5 tracking-tight">
            {SERVICES.efileService.title}
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg font-light">
            {SERVICES.efileService.body}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        <hr className="border-gray-100" />
      </div>

      {/* Competitive Rates */}
      <section className="py-12 md:py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl md:text-2xl font-light text-navy mb-5 tracking-tight">
            {SERVICES.competitiveRates.title}
          </h3>
          <ul className="space-y-3">
            {SERVICES.competitiveRates.bullets.map((bullet) => (
              <li
                key={bullet}
                className="text-gray-700 text-lg font-light flex items-start gap-3"
              >
                <span className="text-navy mt-1.5 text-xs">&#9679;</span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Experience - navy band */}
      <section className="bg-navy text-white py-16 md:py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl md:text-2xl font-light mb-5 tracking-tight">
            {SERVICES.experience.title}
          </h3>
          <p className="text-white/90 leading-relaxed text-lg font-light">
            {SERVICES.experience.body}
          </p>
        </div>
      </section>

      {/* Guaranteed Service */}
      <section className="py-16 md:py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl md:text-2xl font-light text-navy mb-5 tracking-tight">
            {SERVICES.guaranteedService.title}
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg font-light">
            {SERVICES.guaranteedService.body}
          </p>
        </div>
      </section>

      {/* Contact bar */}
      <section className="bg-gray-50 py-10 px-6 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm font-medium mb-1">
            Dou-Mar Tax Services Ltd.
          </p>
          <p className="text-gray-600">
            {CONTACT.fullAddress}&nbsp;&nbsp;Tel.{" "}
            <a href={`tel:${CONTACT.phone}`} className="underline">
              {CONTACT.phone}
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
