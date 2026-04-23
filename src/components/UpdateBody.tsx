import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-gray-700 leading-relaxed font-light text-lg">
        {children}
      </p>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-medium text-navy">{children}</strong>
    ),
    em: ({ children }) => <em>{children}</em>,
    link: ({ value, children }) => {
      const href = (value as { href?: string } | undefined)?.href ?? "#";
      const blank = (value as { blank?: boolean } | undefined)?.blank;
      return (
        <a
          href={href}
          className="text-navy underline hover:text-navy-light"
          target={blank ? "_blank" : undefined}
          rel={blank ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
  },
};

export default function UpdateBody({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className="space-y-5">
      <PortableText value={value} components={components} />
    </div>
  );
}
