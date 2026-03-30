import PageHeader from "@/components/PageHeader";
import { PRIVACY_INTRO, PRIVACY_POLICIES, CONTACT } from "@/lib/constants";

interface PolicySection {
  title: string;
  clauses: string[];
  list?: string[];
  additionalClauses?: string[];
  additionalList?: string[];
  finalClauses?: string[];
}

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Personal Information Protection" />

      <div className="max-w-4xl mx-auto px-6 py-14">
        <p className="text-lg font-light text-gray-700 mb-12 leading-relaxed">
          {PRIVACY_INTRO}
        </p>

        <div className="space-y-12">
          {(PRIVACY_POLICIES as PolicySection[]).map((policy) => (
            <section key={policy.title}>
              <h2 className="text-xl font-medium text-navy mb-5">
                {policy.title}
              </h2>

              <div className="space-y-4">
                {policy.clauses.map((clause, i) => (
                  <p
                    key={i}
                    className="text-gray-700 leading-relaxed font-light pl-4"
                  >
                    {clause}
                  </p>
                ))}

                {policy.list && (
                  <ul className="space-y-2 pl-10">
                    {policy.list.map((item, i) => (
                      <li
                        key={i}
                        className="text-gray-700 font-light flex items-start gap-3"
                      >
                        <span className="text-navy mt-1.5 text-xs shrink-0">
                          &#9679;
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {policy.additionalClauses?.map((clause, i) => (
                  <p
                    key={`ac-${i}`}
                    className="text-gray-700 leading-relaxed font-light pl-4"
                  >
                    {clause}
                  </p>
                ))}

                {policy.additionalList && (
                  <ul className="space-y-2 pl-10">
                    {policy.additionalList.map((item, i) => (
                      <li
                        key={i}
                        className="text-gray-700 font-light flex items-start gap-3"
                      >
                        <span className="text-navy mt-1.5 text-xs shrink-0">
                          &#9679;
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {policy.finalClauses?.map((clause, i) => (
                  <p
                    key={`fc-${i}`}
                    className="text-gray-700 leading-relaxed font-light pl-4"
                  >
                    {clause}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-gray-100 text-gray-500 text-sm">
          <p>Dou-Mar Tax Services Ltd.</p>
          <p>{CONTACT.fullAddress}&nbsp;&nbsp;Tel. {CONTACT.phone}</p>
        </div>
      </div>
    </>
  );
}
