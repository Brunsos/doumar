import { CONTACT } from "@/lib/constants";

export default function ContactBlock() {
  return (
    <div className="space-y-4">
      <p className="text-lg">
        <a
          href={`mailto:${CONTACT.email}`}
          className="underline font-medium"
        >
          {CONTACT.email}
        </a>
      </p>
      <p className="text-lg">
        <a
          href={`tel:${CONTACT.phone}`}
          className="underline font-medium"
        >
          {CONTACT.phone}
        </a>
      </p>
      <p className="text-lg leading-relaxed">
        {CONTACT.address}
        <br />
        {CONTACT.city}, {CONTACT.province}. {CONTACT.postal}
      </p>
    </div>
  );
}
