import type { Facility, Waiting, InsertWaiting, HistoryItem } from "@shared/schema";

export interface FacilitiesResponse {
  facilities: Facility[];
  lastUpdate: string;
}

export interface WaitingResponse {
  waiting: Waiting | null;
}

export interface HistoryResponse {
  history: HistoryItem[];
}

export async function fetchFacilities(): Promise<FacilitiesResponse> {
  const res = await fetch("/api/facilities");
  if (!res.ok) throw new Error("Failed to fetch facilities");
  return res.json();
}

export async function fetchFacility(id: string): Promise<Facility> {
  const res = await fetch(`/api/facilities/${id}`);
  if (!res.ok) throw new Error("Failed to fetch facility");
  return res.json();
}

export async function fetchWaiting(): Promise<WaitingResponse> {
  const res = await fetch("/api/waiting");
  if (!res.ok) throw new Error("Failed to fetch waiting");
  return res.json();
}

export async function createWaiting(data: InsertWaiting): Promise<{ waiting: Waiting }> {
  const res = await fetch("/api/waiting", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create waiting");
  }
  return res.json();
}

export async function cancelWaiting(): Promise<{ success: boolean }> {
  const res = await fetch("/api/waiting", { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to cancel waiting");
  return res.json();
}

export async function fetchHistory(): Promise<HistoryResponse> {
  const res = await fetch("/api/history");
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}
