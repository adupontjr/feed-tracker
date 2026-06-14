"use client";

import { useEffect, useState } from "react";
import type { Feed, FeedType } from "@/lib/types";

const TYPES: FeedType[] = ["breast", "bottle", "formula", "solids", "pumped"];
const STORAGE_KEY = "nibble_feeds";

function loadFromStorage(): Feed[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveToStorage(feeds: Feed[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(feeds));
}

export default function FeedForm() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [type, setType] = useState<FeedType>("bottle");
  const [amountMl, setAmountMl] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const stored = loadFromStorage();
    setFeeds(stored.sort((a, b) => b.startedAt.localeCompare(a.startedAt)));
  }, []);

  function addFeed(e: React.FormEvent) {
    e.preventDefault();
    const feed: Feed = {
      id: crypto.randomUUID(),
      type,
      startedAt: new Date().toISOString(),
      amountMl: amountMl ? Number(amountMl) : undefined,
      notes: notes || undefined,
    };
    const updated = [feed, ...loadFromStorage()];
    saveToStorage(updated);
    setFeeds(updated);
    setAmountMl("");
    setNotes("");
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

        <button type="submit">Log feed</button>
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
