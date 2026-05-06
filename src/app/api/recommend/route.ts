import { NextResponse } from "next/server";
import { searchBooks } from "@/lib/openLibrary";
import { personalize } from "@/lib/personalize";
import type { RecommendRequest, RecommendResponse, Book } from "@/lib/types";

export const runtime = "nodejs";

function isValidBody(body: unknown): body is RecommendRequest {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.destination === "string" &&
    Array.isArray(b.genres) &&
    b.genres.every((g) => typeof g === "string") &&
    typeof b.mood === "string"
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json(
      { error: "Expected { destination, genres, mood }" },
      { status: 400 },
    );
  }

  const destination = body.destination.trim();
  if (!destination) {
    return NextResponse.json(
      { error: "Destination is required" },
      { status: 400 },
    );
  }

  let candidates: Book[];
  try {
    candidates = await searchBooks(destination, body.genres);
  } catch (err) {
    console.error("Open Library error:", err);
    return NextResponse.json(
      { error: "Could not reach the book catalog. Please try again." },
      { status: 502 },
    );
  }

  if (candidates.length === 0) {
    const empty: RecommendResponse = {
      books: [],
      personalized: false,
      notice: `No books found for "${destination}". Try a more specific or well-known destination.`,
    };
    return NextResponse.json(empty);
  }

  const mood = body.mood.trim();

  if (!mood) {
    const response: RecommendResponse = {
      books: candidates.slice(0, 8),
      personalized: false,
    };
    return NextResponse.json(response);
  }

  const { books: ranked, hits } = personalize(mood, candidates);

  if (hits === 0) {
    const response: RecommendResponse = {
      books: candidates.slice(0, 8),
      personalized: false,
      notice:
        "Couldn't find a strong match for that mood — showing top catalog picks instead. Try words like \"atmospheric\", \"funny\", \"classic\", or \"thriller\".",
    };
    return NextResponse.json(response);
  }

  const response: RecommendResponse = {
    books: ranked,
    personalized: true,
    notice:
      hits < 4
        ? `Only ${hits} strong mood match${hits === 1 ? "" : "es"} for this destination — filling in with top catalog picks.`
        : undefined,
  };
  return NextResponse.json(response);
}
