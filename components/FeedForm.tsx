"use client";

import { useEffect, useState } from "react";
import type { Feed, FeedType } from "@/lib/types";

const TYPES: FeedType[] = ["breast", "bottle", "formula", "solids", "pumped"];

export default function FeedForm() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [type, setType] = useState<FeedType>("bottle");
  const [amountMl, setAmountMl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/feeds");
    const json = await res.json();
    setFeeds(json.data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function addFeed(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/feeds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        startedAt: new Date().toISOString(),
        amountMl: amountMl ? Number(amountMl) : undefined,
        notes: notes || undefined,
      }),
    });
    setAmountMl("");
    setNotes("");
    setLoading(false);
    load();
  }

  return (
    <>
      <form className="card" onSubmit={addFeed}>
        <label htmlFor="type">Feed type</label>
        <select id="type" value={type} onChange={(e) => setType(e.target.value as FeedType)}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <label htmlFor="amount">Amount (ml) — optional</label>
        <input
          id="amount"
          type="number"
          min="0"
          value={amountMl}
          onChange={(e) => setAmountMl(e.target.value)}
          placeholder="e.g. 120"
        />

        <label htmlFor="notes">Notes — optional</label>
        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />

        <button type="submit" disabled={loading}>
          {loading ? "Logging…" : "Log feed"}
        </button>
      </form>

      <div className="card">
        <strong>Recent feeds</strong>
        {feeds.length === 0 ? (
          <p className="empty">No feeds logged yet.</p>
        ) : (
          <ul className="feed-list">
            {feeds.map((f) => (
              <li key={f.id}>
                <span>
                  {f.type}
                  {f.amountMl ? ` · ${f.amountMl} ml` : ""}
                </span>
                <span className="empty">{new Date(f.startedAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
