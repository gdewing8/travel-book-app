import type { Book } from "./types";

const SEARCH_URL = "https://openlibrary.org/search.json";
const COVER_URL = (id: number) => `https://covers.openlibrary.org/b/id/${id}-M.jpg`;

type RawDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  subject?: string[];
  first_sentence?: string[] | string;
  isbn?: string[];
};

type SearchResponse = {
  docs?: RawDoc[];
  numFound?: number;
};

const FIELDS = [
  "key",
  "title",
  "author_name",
  "first_publish_year",
  "cover_i",
  "subject",
  "first_sentence",
  "isbn",
].join(",");

function quoteIfMultiWord(value: string): string {
  return /\s/.test(value) ? `"${value}"` : value;
}

function buildQuery(destination: string, genreSubjects: string[]): string {
  const parts = [`place:${quoteIfMultiWord(destination.toLowerCase())}`];
  for (const g of genreSubjects) {
    parts.push(`subject:${quoteIfMultiWord(g.toLowerCase())}`);
  }
  return parts.join(" ");
}

async function fetchSearch(q: string): Promise<RawDoc[]> {
  const params = new URLSearchParams();
  params.set("q", q);
  params.set("fields", FIELDS);
  params.set("limit", "25");
  const url = `${SEARCH_URL}?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "TravelBookApp/0.1 (educational project)",
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Open Library returned ${res.status}`);
  }
  const data = (await res.json()) as SearchResponse;
  return data.docs ?? [];
}

function toBook(doc: RawDoc): Book | null {
  if (!doc.title || !doc.key) return null;
  const author = doc.author_name?.[0] ?? "Unknown";
  const sentence = Array.isArray(doc.first_sentence)
    ? doc.first_sentence[0]
    : doc.first_sentence;
  return {
    key: doc.key,
    title: doc.title,
    author,
    year: doc.first_publish_year ?? null,
    coverUrl: doc.cover_i ? COVER_URL(doc.cover_i) : null,
    blurb: sentence ?? null,
    rationale: null,
    subjects: doc.subject?.slice(0, 8) ?? [],
  };
}

function dedupe(books: Book[]): Book[] {
  const seen = new Set<string>();
  const out: Book[] = [];
  for (const b of books) {
    if (seen.has(b.key)) continue;
    seen.add(b.key);
    out.push(b);
  }
  return out;
}

export async function searchBooks(
  destination: string,
  genreSubjects: string[],
): Promise<Book[]> {
  const place = destination.trim();
  if (!place) return [];

  const primaryQuery = buildQuery(place, genreSubjects);
  let docs = await fetchSearch(primaryQuery);

  if (docs.length < 5) {
    const placeOnly = buildQuery(place, []);
    if (placeOnly !== primaryQuery) {
      const more = await fetchSearch(placeOnly);
      docs = [...docs, ...more];
    }
  }

  if (docs.length < 5) {
    const broad = quoteIfMultiWord(place.toLowerCase());
    const more = await fetchSearch(broad);
    docs = [...docs, ...more];
  }

  const books = docs
    .map(toBook)
    .filter((b): b is Book => b !== null)
    .filter((b) => b.author !== "Unknown" || b.coverUrl !== null);

  return dedupe(books);
}
