/**
 * The AI Mufti mark.
 *
 * A mihrab — the niche a congregation faces for guidance — holding an open book,
 * with a light above it. The book is the point: this assistant answers only from
 * what is written in the books, and the mark says so before a word is read.
 *
 * Inlined rather than loaded as a file so it costs no request, never flashes in
 * late, and stays crisp at every size from a 24px favicon upward.
 */
export default function Logo({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="AI Mufti"
      focusable="false"
    >
      <path
        d="M32 4C33.5 11.8 39.4 14.5 43.6 19.6C47.8 24.7 49.2 29.8 49.2 34.9V54.5C49.2 55.9 48.1 57 46.7 57H17.3C15.9 57 14.8 55.9 14.8 54.5V34.9C14.8 29.8 16.2 24.7 20.4 19.6C24.6 14.5 30.5 11.8 32 4Z"
        fill="#16a34a"
      />
      <path
        d="M32 38.8c-2.9-2.6-7.9-3.5-13.4-2.6v11.2c5.5-0.9 10.5 0 13.4 2.6 2.9-2.6 7.9-3.5 13.4-2.6V36.2c-5.5-0.9-10.5 0-13.4 2.6z"
        fill="#fbf8f1"
      />
      <path d="M32 38.8v11.2" stroke="#16a34a" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M32 15l1.9 5 5 1.9-5 1.9-1.9 5-1.9-5-5-1.9 5-1.9z" fill="#f2d492" />
    </svg>
  );
}
