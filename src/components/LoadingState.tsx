type Props = {
  personalizing: boolean;
};

export function LoadingState({ personalizing }: Props) {
  return (
    <div>
      <p className="mb-4 text-sm text-ink/60">
        {personalizing
          ? "Reading the catalog and matching your mood…"
          : "Searching the catalog…"}
      </p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-ink/10 bg-white"
          >
            <div className="skeleton aspect-[2/3] w-full" />
            <div className="space-y-2 p-4">
              <div className="skeleton h-5 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-5/6 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
