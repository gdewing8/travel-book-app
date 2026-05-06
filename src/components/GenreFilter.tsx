"use client";

import { GENRES } from "@/data/genres";

type Props = {
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
};

export function GenreFilter({ selected, onChange, disabled }: Props) {
  function toggle(subject: string) {
    if (selected.includes(subject)) {
      onChange(selected.filter((s) => s !== subject));
    } else {
      onChange([...selected, subject]);
    }
  }

  return (
    <div
      role="group"
      aria-label="Filter by genre"
      className="flex flex-wrap gap-2"
    >
      {GENRES.map((g) => {
        const active = selected.includes(g.subject);
        return (
          <button
            key={g.subject}
            type="button"
            onClick={() => toggle(g.subject)}
            disabled={disabled}
            aria-pressed={active}
            className={`min-h-[44px] rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
              active
                ? "border-accent bg-accent text-white shadow-sm"
                : "border-ink/15 bg-white text-ink hover:border-ink/30"
            }`}
          >
            {g.label}
          </button>
        );
      })}
    </div>
  );
}
