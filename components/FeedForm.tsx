"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Feed, FeedType } from "@/lib/types";

const TYPES: { value: FeedType; label: string; color: string }[] = [
  { value: "breast",       label: "Breast",       color: "#f472b6" },
  { value: "pumped",       label: "Pumped",       color: "#a78bfa" },
  { value: "formula",      label: "Formula",      color: "#60a5fa" },
  { value: "wet_diaper",   label: "Wet Diaper",   color: "#34d399" },
  { value: "soiled_diaper",label: "Soiled Diaper",color: "#fb923c" },
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

function buildChartData(feeds: Feed[]) {
  if (feeds.length === 0) return null;
  const earliest = feeds.reduce(
    (min, f) => (f.startedAt < min ? f.startedAt : min),
    feeds[0].startedAt,
  );
  const start = new Date(earliest);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rows: Record<string, Record<string, number>> = {};
  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    rows[key] = Object.fromEntries(TYPES.map((t) => [t.value, 0]));
  }
  for (const f of feeds) {
    const key = new Date(f.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (rows[key]) rows[key][f.type] = (rows[key][f.type] ?? 0) + 1;
  }
  return Object.entries(rows).map(([date, counts]) => ({ date, ...counts }));
}

function dailyAverages(feeds: Feed[]) {
  if (feeds.length === 0) return null;
  const earliest = feeds.reduce(
    (min, f) => (f.startedAt < min ? f.startedAt : min),
    feeds[0].startedAt,
  );
  const days = Math.max(1, Math.ceil((Date.now() - new Date(earliest).getTime()) / 86_400_000));
  return TYPES.map(({ value, label }) => ({
    label,
    count: feeds.filter((f) => f.type === value).length,
    avg: feeds.filter((f) => f.type === value).length / days,
  }));
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

        {type !== "wet_diaper" && type !== "soiled_diaper" && (
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

        <button type="submit">
          {type === "wet_diaper" || type === "soiled_diaper" ? "Log diaper" : "Log feed"}
        </button>
      </form>

      {dailyAverages(feeds) && (
        <div className="card">
          <strong>Daily averages</strong>
          <ul className="feed-list">
            {dailyAverages(feeds)!.map(({ label, count, avg }) => (
              <li key={label}>
                <span>{label}</span>
                <span>
                  {avg.toFixed(1)}<span className="empty">/day</span>
                  <span className="empty"> · {count} total</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {buildChartData(feeds) && (
        <div className="card">
          <strong>Activity over time</strong>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={buildChartData(feeds)!} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {TYPES.map(({ value, label, color }) => (
                <Line
                  key={value}
                  type="monotone"
                  dataKey={value}
                  name={label}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

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
