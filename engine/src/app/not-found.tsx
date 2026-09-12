import Link from "next/link";

export default function NotFound() {
  return (
    <main className="message-page">
      <p className="eyebrow">Not available</p>
      <h1>This object is absent or outside your view.</h1>
      <Link href="/">Return to Forum</Link>
    </main>
  );
}
