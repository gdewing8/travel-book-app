"use client";

import { useState } from "react";
import { SearchForm, type SearchValues } from "@/components/SearchForm";
import { BookGrid } from "@/components/BookGrid";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import type { RecommendResponse } from "@/lib/types";

type Status =
  | { kind: "idle" }
  | { kind: "loading"; personalizing: boolean; destination: string }
  | { kind: "error"; message: string }
  | { kind: "results"; data: RecommendResponse; destination: string };

export default function Home() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSearch(values: SearchValues) {
    setStatus({
      kind: "loading",
      personalizing: values.mood.length > 0,
      destination: values.destination,
    });
    try {
      const params = new URLSearchParams();
      params.set("destination", values.destination);
      if (values.mood) params.set("mood", values.mood);
      for (const g of values.genres) params.append("genre", g);
      const res = await fetch(`/api/recommend?${params.toString()}`);
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setStatus({
          kind: "error",
          message: body.error ?? "Something went wrong. Please try again.",
        });
        return;
      }
      const data = (await res.json()) as RecommendResponse;
      setStatus({ kind: "results", data, destination: values.destination });
    } catch {
      setStatus({
        kind: "error",
        message:
          "Couldn't reach the server. Check your connection and try again.",
      });
    }
  }

  const loading = status.kind === "loading";

  return (
    <main className="min-h-dvh bg-cream">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-8 sm:mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Bookmark
          </p>
          <h1 className="font-serif text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl">
            Books for where you&rsquo;re going.
          </h1>
          <p className="mt-3 max-w-xl text-base text-ink/70 sm:text-lg">
            Type a destination and we&rsquo;ll surface books set in &mdash; or about
            &mdash; that place. Filter by genre, or describe your mood to
            personalize the picks.
          </p>
        </header>

        <section className="mb-8 rounded-2xl border border-ink/10 bg-white p-5 shadow-sm sm:p-7">
          <SearchForm onSubmit={handleSearch} loading={loading} />
        </section>

        <section aria-live="polite">
          {status.kind === "error" && (
            <ErrorBanner
              message={status.message}
              onDismiss={() => setStatus({ kind: "idle" })}
            />
          )}

          {status.kind === "loading" && (
            <LoadingState personalizing={status.personalizing} />
          )}

          {status.kind === "results" && (
            <>
              {status.data.notice && (
                <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  {status.data.notice}
                </p>
              )}
              {status.data.books.length === 0 ? (
                <EmptyState
                  message={
                    status.data.notice ??
                    `No books found for "${status.destination}".`
                  }
                />
              ) : (
                <>
                  <h2 className="mb-4 font-serif text-xl text-ink sm:text-2xl">
                    {status.data.personalized
                      ? `Picked for you in ${status.destination}`
                      : `Books set in ${status.destination}`}
                  </h2>
                  <BookGrid books={status.data.books} />
                </>
              )}
            </>
          )}
        </section>

        <footer className="mt-16 border-t border-ink/10 pt-6 text-center text-xs text-ink/40">
          Book data from{" "}
          <a
            href="https://openlibrary.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-ink/60"
          >
            Open Library
          </a>
          .
        </footer>
      </div>
    </main>
  );
}
