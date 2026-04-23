"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";
import Logo from "./Logo";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <nav className="max-w-6xl mx-auto px-6">
        {/* Top bar with logo */}
        <div className="flex flex-col sm:flex-row items-center justify-between py-4">
          <Link href="/" className="no-underline">
            <Logo />
          </Link>

          {/* Contact info - subtle top right */}
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a
              href="tel:306-205-4185"
              className="no-underline hover:text-navy transition-colors"
            >
              306-205-4185
            </a>
            <span className="text-gray-400">|</span>
            <a
              href="mailto:info@doumar.ca"
              className="no-underline hover:text-navy transition-colors"
            >
              info@doumar.ca
            </a>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex flex-wrap items-center justify-center gap-0.5 pb-3 -mt-1">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-[0.85rem] tracking-wide uppercase no-underline transition-all duration-200 ${
                  isActive
                    ? "text-navy border-b-2 border-navy font-medium"
                    : "text-gray-500 hover:text-navy border-b-2 border-transparent"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
