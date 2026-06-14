"use client";

import { useEffect, useState } from "react";
import type { Feed, FeedType } from "@/lib/types";

const TYPES: { value: FeedType; label: string }[] = [
  { value: "breast", label: "Breast" },
  { value: "pumped", label: "Pumped" },
  { value: "formula", label: "Formula" },
  { value: "diaper", label: "Diaper Change" },
];
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
  const [type, setType] = useState<FeedType>("breast");
  const [amountOz, setAmountOz] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const stored = loadFromStorage();
    setFeeds(stored.sort((a, b) => b.startedAt.localeCompare(a.startedAt)));
  }, []);

  function handleTypeChange(next: FeedType) {
    setType(next);
    setAmountOz(next === "formula" ? "2" : "");
  }

  function addFeed(e: React.FormEvent) {
    e.preventDefault();
    const feed: Feed = {
      id: crypto.randomUUID(),
      type,
      startedAt: new Date().toISOString(),
      amountOz: amountOz ? Number(amountOz) : undefined,
      notes: notes || undefined,
    };
    const updated = [feed, ...loadFromStorage()];
    saveToStorage(updated);
    setFeeds(updated);
    setAmountOz(type === "formula" ? "2" : "");
    setNotes("");
  }

  return (
    <>
      <form className="card" onSubmit={addFeed}>
        <label htmlFor="type">Feed type</label>
        <select id="type" value={type} onChange={(e) => handleTypeChange(e.target.value as FeedType)}>
          {TYPES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {type !== "diaper" && (
          <>
            <label htmlFor="amount">Amount (oz){type !== "formula" ? " — optional" : ""}</label>
            <input
              id="amount"
              type="number"
              min="0"
              step="0.5"
              value={amountOz}
              onChange={(e) => setAmountOz(e.target.value)}
              placeholder="e.g. 2"
            />
          </>
        )}

        <label htmlFor="notes">Notes — optional</label>
        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />

        <button type="submit">{type === "diaper" ? "Log diaper change" : "Log feed"}</button>
      </form>

      <div className="card">
        <strong>Recent logs</strong>
        {feeds.length === 0 ? (
          <p className="empty">No entries logged yet.</p>
        ) : (
          <ul className="feed-list">
            {feeds.map((f) => (
              <li key={f.id}>
                <span>
                  {TYPES.find((t) => t.value === f.type)?.label ?? f.type}
                  {f.amountOz ? ` · ${f.amountOz} oz` : ""}
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
