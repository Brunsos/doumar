import { defineQuery } from "next-sanity";

export const updatesQuery = defineQuery(`
  *[_type == "update"] | order(publishedAt desc){
    _id,
    title,
    date,
    greeting,
    body,
    signoff,
    author,
    publishedAt
  }
`);
