# Bookmark — Travel Book App

A mobile-first web app that recommends books for the place you're traveling to. Filter by genre and (optionally) describe your mood to re-rank the picks.

No API keys, no accounts, no backend AI calls. Works on iPhone, Android, or any modern browser.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS for styling (mobile-first responsive)
- [Open Library](https://openlibrary.org) API for the book catalog (no key required)
- A small in-process heuristic for mood-based re-ranking — keyword expansion + scoring against subject tags / titles / blurbs

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## How it works

1. The browser posts `{ destination, genres, mood }` to `/api/recommend`.
2. The server route fetches up to 25 candidate books from Open Library using `q=place:<destination> subject:<genre>`.
3. If the user provided a mood string, the server tokenizes it, expands keywords (e.g., "atmospheric" → also matches "literary", "gothic", "noir"), and scores each candidate book against its subjects, title, and blurb. Top 8 are returned with a transparent rationale that names the matched signals.
4. If the mood is empty (or finds no positive matches), the top 8 catalog matches are returned without rationale.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run typecheck` — TypeScript check
- `npm run lint` — Next.js lint

## Extending the personalization

`src/lib/personalize.ts` is intentionally simple. To add new mood vocabulary, edit `SUBJECT_HINTS` (mood word → list of related Open Library subjects) and `STOPWORDS`. The era detection (`old` vs. `new`) lives in the same file.
