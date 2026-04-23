import PageHeader from "@/components/PageHeader";
import UpdateBody from "@/components/UpdateBody";
import { CONTACT } from "@/lib/constants";
import { client } from "@/sanity/client";
import { updatesQuery } from "@/sanity/queries";
import type { Update } from "@/types";

export const revalidate = 60;

export default async function UpdatesPage() {
  const updates = await client.fetch<Update[]>(updatesQuery);

  return (
    <>
      <PageHeader title="Updates" />

      <div className="max-w-4xl mx-auto px-6 py-14">
        {updates.length === 0 ? (
          <p className="text-gray-700 leading-relaxed font-light text-lg">
            No updates yet — check back soon.
          </p>
        ) : (
          updates.map((update) => (
            <article key={update._id}>
              <p className="text-sm font-medium uppercase tracking-wider text-gray-400 mb-8">
                {update.date}
              </p>

              {update.greeting && (
                <p className="text-xl font-medium text-navy mb-8 leading-relaxed">
                  {update.greeting}
                </p>
              )}

              <UpdateBody value={update.body} />

              <div className="mt-10">
                {update.signoff && (
                  <p className="text-navy font-medium text-lg">
                    {update.signoff}
                  </p>
                )}
                {update.author && (
                  <p className="text-navy font-medium text-lg mt-2">
                    {update.author}
                  </p>
                )}
              </div>
            </article>
          ))
        )}

        <div className="mt-14 pt-8 border-t border-gray-100 text-gray-500 text-sm">
          <p>Dou-Mar Tax Services Ltd.</p>
          <p>{CONTACT.fullAddress}&nbsp;&nbsp;Tel. {CONTACT.phone}</p>
        </div>
      </div>
    </>
  );
}
