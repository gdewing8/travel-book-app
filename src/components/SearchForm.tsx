"use client";

import { useState } from "react";
import { GenreFilter } from "./GenreFilter";

export type SearchValues = {
  destination: string;
  genres: string[];
  mood: string;
};

type Props = {
  onSubmit: (values: SearchValues) => void;
  loading: boolean;
};

export function SearchForm({ onSubmit, loading }: Props) {
  const [destination, setDestination] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [mood, setMood] = useState("");
  const [showMood, setShowMood] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!destination.trim()) {
      setError("Tell us where you're going.");
      return;
    }
    setError(null);
    onSubmit({ destination: destination.trim(), genres, mood: mood.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label
          htmlFor="destination"
          className="mb-2 block text-sm font-semibold text-ink"
        >
          Where are you going?
        </label>
        <input
          id="destination"
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. Paris, Tokyo, Patagonia, Iceland"
          autoComplete="off"
          className="w-full min-h-[52px] rounded-lg border border-ink/15 bg-white px-4 py-3 text-base text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          disabled={loading}
        />
        {error && (
          <p className="mt-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-ink">
          Filter by genre{" "}
          <span className="font-normal text-ink/50">(optional)</span>
        </p>
        <GenreFilter
          selected={genres}
          onChange={setGenres}
          disabled={loading}
        />
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowMood((s) => !s)}
          className="text-sm font-semibold text-accent hover:text-accentHover min-h-[44px]"
          aria-expanded={showMood}
        >
          {showMood ? "− Hide personalization" : "+ Personalize my picks"}
        </button>
        {showMood && (
          <div className="mt-3">
            <label
              htmlFor="mood"
              className="mb-2 block text-sm font-medium text-ink/80"
            >
              What kind of read are you in the mood for?
            </label>
            <textarea
              id="mood"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="e.g. atmospheric and slow, or a punchy mystery, or something funny and modern"
              rows={3}
              maxLength={500}
              disabled={loading}
              className="w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-base text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            />
            <p className="mt-1 text-xs text-ink/50">
              Words like &ldquo;atmospheric&rdquo;, &ldquo;cozy&rdquo;,
              &ldquo;classic&rdquo;, or &ldquo;funny&rdquo; help us re-rank.
            </p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="min-h-[52px] rounded-lg bg-accent px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-accentHover disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? "Finding books…" : "Find books"}
      </button>
    </form>
  );
}
