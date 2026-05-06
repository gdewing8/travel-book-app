import Image from "next/image";
import type { Book } from "@/lib/types";

type Props = {
  book: Book;
};

export function BookCard({ book }: Props) {
  const openLibraryUrl = `https://openlibrary.org${book.key}`;
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[2/3] w-full bg-ink/5">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-4 text-center text-sm text-ink/40">
            No cover
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-serif text-lg leading-snug text-ink line-clamp-2">
          {book.title}
        </h3>
        <p className="text-sm text-ink/60">
          {book.author}
          {book.year ? ` · ${book.year}` : ""}
        </p>
        {book.rationale ? (
          <p className="mt-1 text-sm text-ink/80 leading-relaxed">
            <span className="font-semibold text-accent">Why this</span>:{" "}
            {book.rationale}
          </p>
        ) : book.blurb ? (
          <p className="mt-1 text-sm text-ink/70 leading-relaxed line-clamp-3">
            {book.blurb}
          </p>
        ) : null}
        <a
          href={openLibraryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto pt-2 text-sm font-semibold text-accent hover:text-accentHover"
        >
          View on Open Library →
        </a>
      </div>
    </article>
  );
}
