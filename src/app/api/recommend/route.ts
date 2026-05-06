import { NextResponse } from "next/server";
import { searchBooks } from "@/lib/openLibrary";
import { personalize } from "@/lib/personalize";
import type { RecommendResponse, Book } from "@/lib/types";

export const runtime = "nodejs";

const MAX_DESTINATION_LEN = 100;
const MAX_MOOD_LEN = 500;
const MAX_GENRES = 20;
const MAX_GENRE_LEN = 50;

const CACHE_HEADER =
  "public, s-maxage=86400, stale-while-revalidate=604800";

type ParsedQuery =
  | { ok: true; destination: string; genres: string[]; mood: string }
  | { ok: false; error: string };

function parseQuery(url: URL): ParsedQuery {
  const destination = (url.searchParams.get("destination") ?? "").trim();
  const mood = (url.searchParams.get("mood") ?? "").trim();
  const genres = url.searchParams.getAll("genre");

  if (!destination) return { ok: false, error: "Destination is required" };
  if (destination.length > MAX_DESTINATION_LEN) {
    return { ok: false, error: "Destination too long" };
  }
  if (mood.length > MAX_MOOD_LEN) {
    return { ok: false, error: "Mood too long" };
  }
  if (genres.length > MAX_GENRES) {
    return { ok: false, error: "Too many genres" };
  }
  if (genres.some((g) => g.length > MAX_GENRE_LEN)) {
    return { ok: false, error: "Genre value too long" };
  }

  return { ok: true, destination, genres, mood };
}

function jsonWithCache(body: RecommendResponse, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": CACHE_HEADER },
  });
}

export async function GET(request: Request) {
  const parsed = parseQuery(new URL(request.url));
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { destination, genres, mood } = parsed;

  let candidates: Book[];
  try {
    candidates = await searchBooks(destination, genres);
  } catch (err) {
    console.error("Open Library error:", err);
    return NextResponse.json(
      { error: "Could not reach the book catalog. Please try again." },
      { status: 502 },
    );
  }

  if (candidates.length === 0) {
    return jsonWithCache({
      books: [],
      personalized: false,
      notice: `No books found for "${destination}". Try a more specific or well-known destination.`,
    });
  }

  if (!mood) {
    return jsonWithCache({
      books: candidates.slice(0, 8),
      personalized: false,
    });
  }

  const { books: ranked, hits } = personalize(mood, candidates);

  if (hits === 0) {
    return jsonWithCache({
      books: candidates.slice(0, 8),
      personalized: false,
      notice:
        "Couldn't find a strong match for that mood — showing top catalog picks instead. Try words like \"atmospheric\", \"funny\", \"classic\", or \"thriller\".",
    });
  }

  return jsonWithCache({
    books: ranked,
    personalized: true,
    notice:
      hits < 4
        ? `Only ${hits} strong mood match${hits === 1 ? "" : "es"} for this destination — filling in with top catalog picks.`
        : undefined,
  });
}
