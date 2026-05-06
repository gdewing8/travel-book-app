import type { Book } from "@/lib/types";
import { BookCard } from "./BookCard";

type Props = {
  books: Book[];
};

export function BookGrid({ books }: Props) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((b) => (
        <BookCard key={b.key} book={b} />
      ))}
    </div>
  );
}
