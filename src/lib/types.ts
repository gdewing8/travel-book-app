export type Book = {
  key: string;
  title: string;
  author: string;
  year: number | null;
  coverUrl: string | null;
  blurb: string | null;
  rationale: string | null;
  subjects: string[];
};

export type RecommendRequest = {
  destination: string;
  genres: string[];
  mood: string;
};

export type RecommendResponse = {
  books: Book[];
  personalized: boolean;
  notice?: string;
};
