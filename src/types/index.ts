export interface Service {
  title: string;
  description: string;
}

import type { PortableTextBlock } from "@portabletext/types";

export interface Update {
  _id: string;
  title: string;
  date: string;
  greeting?: string;
  body: PortableTextBlock[];
  signoff?: string;
  author?: string;
  publishedAt: string;
}

export interface NavLink {
  href: string;
  label: string;
}

export type { IntakeSchemaType } from "@/lib/validation";
