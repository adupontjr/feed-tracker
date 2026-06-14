import { NextResponse } from "next/server";
import type { Feed, NewFeed } from "@/lib/types";

// NOTE: This in-memory store is a placeholder so the scaffold runs end-to-end.
// Serverless functions are stateless/ephemeral on Vercel — data here will NOT
// persist between requests or deploys. Swap this for a real database
// (Vercel Postgres, Neon, Supabase, etc.) before relying on it.
const feeds: Feed[] = [];

export async function GET() {
  // Newest first.
  const sorted = [...feeds].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  return NextResponse.json({ data: sorted, total: sorted.length });
}

export async function POST(request: Request) {
  let body: NewFeed;
  try {
    body = (await request.json()) as NewFeed;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.type || !body.startedAt) {
    return NextResponse.json(
      { error: "`type` and `startedAt` are required" },
      { status: 422 },
    );
  }

  const feed: Feed = { id: crypto.randomUUID(), ...body };
  feeds.push(feed);
  return NextResponse.json(feed, { status: 201 });
}
