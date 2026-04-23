import { defineArrayMember, defineField, defineType } from "sanity";

export const update = defineType({
  name: "update",
  title: "Update",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description: "Short label used in the Studio list (not shown on the site).",
      type: "string",
      validation: (r) => r.required().max(80),
    }),
    defineField({
      name: "date",
      title: "Display Date",
      description:
        'The date shown on the page, e.g. "January 2, 2026". Free-form text.',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "greeting",
      title: "Greeting",
      description: "Optional opening line, e.g. \"Happy New Year...\"",
      type: "string",
    }),
    defineField({
      name: "body",
      title: "Body",
      description:
        "Main text of the update. Supports paragraphs, bold, italic, and links.",
      type: "array",
      validation: (r) => r.required().min(1),
      of: [
        defineArrayMember({
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                    validation: (r) => r.required(),
                  },
                  {
                    name: "blank",
                    type: "boolean",
                    title: "Open in new tab",
                    initialValue: true,
                  },
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: "signoff",
      title: "Sign-off",
      type: "string",
      initialValue: "Sincerely,",
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      initialValue: "Mark Green, Owner",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      description: "Used to sort updates. Defaults to now.",
      type: "datetime",
      validation: (r) => r.required(),
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "date",
    },
  },
});
