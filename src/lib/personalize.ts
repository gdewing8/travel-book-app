import type { Book } from "./types";

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "if", "of", "in", "on", "at", "to",
  "for", "with", "without", "from", "by", "is", "are", "am", "was", "were",
  "be", "been", "being", "i", "me", "my", "mine", "you", "your", "yours",
  "we", "us", "our", "they", "them", "their", "this", "that", "these",
  "those", "it", "its", "as", "so", "than", "too", "very", "just", "want",
  "wanting", "looking", "look", "need", "needing", "kind", "type", "sort",
  "something", "anything", "some", "any", "read", "reading", "book",
  "books", "novel", "novels", "story", "stories", "would", "like", "love",
  "really", "maybe", "could", "should", "into", "about", "give", "get",
  "make", "find", "have", "has", "had", "do", "does", "did", "will", "can",
]);

const SUBJECT_HINTS: Record<string, string[]> = {
  atmospheric: ["literary", "literature", "gothic", "noir", "atmosphere"],
  moody: ["literary", "noir", "gothic", "psychological"],
  slow: ["literary", "literature", "slow"],
  melancholy: ["literary", "tragedy", "loss", "grief", "sad"],
  sad: ["tragedy", "loss", "grief"],
  dark: ["noir", "gothic", "psychological", "thriller"],
  cozy: ["cozy", "domestic", "comfort", "small town"],
  funny: ["humor", "comedy", "humorous", "satire"],
  humor: ["humor", "comedy", "humorous", "satire"],
  funny_alt: ["humor"],
  romantic: ["romance", "love"],
  romance: ["romance", "love"],
  fast: ["thriller", "suspense", "action"],
  punchy: ["thriller", "crime"],
  thriller: ["thriller", "suspense"],
  mystery: ["mystery", "detective", "crime"],
  history: ["history", "historical"],
  historical: ["history", "historical"],
  classic: ["classics", "classic"],
  travel: ["travel", "travelogue"],
  food: ["cooking", "food", "cuisine"],
  cooking: ["cooking", "food"],
  memoir: ["biography", "memoir", "autobiography"],
  biography: ["biography", "memoir"],
  literary: ["literary", "literature"],
  short: ["short stories"],
  long: ["epic", "saga"],
  epic: ["epic", "saga"],
  adventure: ["adventure"],
  war: ["war"],
  philosophical: ["philosophy"],
  philosophy: ["philosophy"],
  poetic: ["poetry"],
  poetry: ["poetry"],
  spy: ["spy", "espionage"],
  espionage: ["spy", "espionage"],
};

const ERA_OLD = ["old", "classic", "vintage", "older", "historical"];
const ERA_NEW = ["new", "modern", "recent", "contemporary"];

type Token = { word: string };

function tokenize(input: string): Token[] {
  return input
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
    .map((word) => ({ word }));
}

function expandKeywords(tokens: Token[]): string[] {
  const out = new Set<string>();
  for (const t of tokens) {
    out.add(t.word);
    const hints = SUBJECT_HINTS[t.word];
    if (hints) for (const h of hints) out.add(h);
  }
  return [...out];
}

function detectEraPreference(tokens: Token[]): "old" | "new" | null {
  const words = tokens.map((t) => t.word);
  if (words.some((w) => ERA_OLD.includes(w))) return "old";
  if (words.some((w) => ERA_NEW.includes(w))) return "new";
  return null;
}

function countMatches(haystack: string, needles: string[]): string[] {
  const lower = haystack.toLowerCase();
  const matched: string[] = [];
  for (const n of needles) {
    if (lower.includes(n)) matched.push(n);
  }
  return matched;
}

function scoreBook(
  book: Book,
  keywords: string[],
  eraPreference: "old" | "new" | null,
): { score: number; matched: Set<string> } {
  const matched = new Set<string>();
  let score = 0;

  const subjectsBlob = book.subjects.join(" | ");
  for (const m of countMatches(subjectsBlob, keywords)) {
    score += 3;
    matched.add(m);
  }
  for (const m of countMatches(book.title, keywords)) {
    score += 2;
    matched.add(m);
  }
  if (book.blurb) {
    for (const m of countMatches(book.blurb, keywords)) {
      score += 1;
      matched.add(m);
    }
  }

  if (eraPreference === "old" && book.year && book.year < 1970) score += 2;
  if (eraPreference === "new" && book.year && book.year >= 2000) score += 2;

  return { score, matched };
}

function buildRationale(
  matched: Set<string>,
  eraPreference: "old" | "new" | null,
  book: Book,
): string {
  const tags = [...matched].slice(0, 3);
  const parts: string[] = [];

  if (tags.length > 0) {
    parts.push(`Picks up on your interest in ${formatList(tags)}`);
  }

  if (eraPreference === "old" && book.year && book.year < 1970) {
    parts.push(`a classic from ${book.year}`);
  } else if (eraPreference === "new" && book.year && book.year >= 2000) {
    parts.push(`a contemporary read (${book.year})`);
  }

  if (parts.length === 0) {
    return `A strong catalog match for this destination.`;
  }
  return `${parts.join(" — ")}.`;
}

function formatList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export type PersonalizeResult = {
  books: Book[];
  hits: number;
};

export function personalize(
  mood: string,
  candidates: Book[],
): PersonalizeResult {
  const tokens = tokenize(mood);
  if (tokens.length === 0) return { books: [], hits: 0 };

  const keywords = expandKeywords(tokens);
  const eraPreference = detectEraPreference(tokens);

  const scored = candidates.map((book) => {
    const { score, matched } = scoreBook(book, keywords, eraPreference);
    return { book, score, matched };
  });

  scored.sort((a, b) => b.score - a.score);

  const positives = scored.filter((s) => s.score > 0);
  const fillers = scored.filter((s) => s.score === 0);

  const ranked: Book[] = positives.slice(0, 8).map(({ book, matched }) => ({
    ...book,
    rationale: buildRationale(matched, eraPreference, book),
  }));

  for (const f of fillers) {
    if (ranked.length >= 8) break;
    ranked.push(f.book);
  }

  return { books: ranked, hits: positives.length };
}
