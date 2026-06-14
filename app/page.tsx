import FeedForm from "@/components/FeedForm";

export default function Home() {
  return (
    <main>
      <header>
        <div className="brand">🍼 Nibble</div>
        <p className="tagline">Quick, simple feed logging for your little one.</p>
      </header>
      <FeedForm />
    </main>
  );
}
