"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="message-page">
      <p className="eyebrow">Interrupted</p>
      <h1>Forum could not open this surface.</h1>
      <button type="button" onClick={() => reset()}>Try again</button>
    </main>
  );
}
