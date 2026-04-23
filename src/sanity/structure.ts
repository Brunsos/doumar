import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Updates")
        .schemaType("update")
        .child(S.documentTypeList("update").title("Updates")),
    ]);
