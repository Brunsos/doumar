import Link from "next/link";
import { CONTACT, NAV_LINKS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-navy text-white mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-medium mb-2 tracking-tight">
              Dou-Mar Tax Services Ltd.
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Professional tax preparation services serving Saskatchewan
              residents since 1989.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white no-underline transition-colors text-[0.9rem]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-white/70 text-[0.9rem]">
              <li>
                <a
                  href={`tel:${CONTACT.phone}`}
                  className="text-white/70 hover:text-white no-underline transition-colors"
                >
                  Tel. {CONTACT.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="text-white/70 hover:text-white no-underline transition-colors"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li className="leading-relaxed">
                {CONTACT.address}
                <br />
                {CONTACT.city}, {CONTACT.province}. {CONTACT.postal}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-white/40 text-sm">
          &copy; {new Date().getFullYear()} Dou-Mar Tax Services Ltd. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
