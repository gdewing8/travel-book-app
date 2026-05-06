type Props = {
  message: string;
};

export function EmptyState({ message }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-ink/20 bg-white/60 p-8 text-center">
      <p className="text-base text-ink/70">{message}</p>
      <p className="mt-2 text-sm text-ink/50">
        Try a city, region, or country (e.g. &ldquo;Kyoto&rdquo;,
        &ldquo;Provence&rdquo;, &ldquo;Iceland&rdquo;).
      </p>
    </div>
  );
}
