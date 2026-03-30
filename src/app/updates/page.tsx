import PageHeader from "@/components/PageHeader";
import { UPDATES, CONTACT } from "@/lib/constants";

export default function UpdatesPage() {
  return (
    <>
      <PageHeader title="Updates" />

      <div className="max-w-4xl mx-auto px-6 py-14">
        {UPDATES.map((update) => (
          <article key={update.date}>
            <p className="text-sm font-medium uppercase tracking-wider text-gray-400 mb-8">
              {update.date}
            </p>

            <p className="text-xl font-medium text-navy mb-8 leading-relaxed">
              {update.greeting}
            </p>

            <div className="space-y-5">
              {update.paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-gray-700 leading-relaxed font-light text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-10">
              <p className="text-navy font-medium text-lg">{update.signoff}</p>
              <p className="text-navy font-medium text-lg mt-2">
                {update.author}
              </p>
            </div>
          </article>
        ))}

        <div className="mt-14 pt-8 border-t border-gray-100 text-gray-500 text-sm">
          <p>Dou-Mar Tax Services Ltd.</p>
          <p>{CONTACT.fullAddress}&nbsp;&nbsp;Tel. {CONTACT.phone}</p>
        </div>
      </div>
    </>
  );
}
