/**
 * Skip link for keyboard users to jump to main content.
 */
export function SkipToMainLink() {
  return (
    <a
      className="sr-only fixed top-4 left-4 z-[100] rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      href="#main-content"
    >
      Ir para o conteúdo principal
    </a>
  );
}
