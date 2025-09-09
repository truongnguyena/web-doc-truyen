"use client";

import { useEffect, useState } from "react";

type Note = { page: number; text: string; at: number };

type Stored = {
  lastPage: number;
  bookmarks: number[];
  notes: Note[];
};

function load(key: string): Stored {
  if (typeof window === "undefined") return { lastPage: 0, bookmarks: [], notes: [] };
  try {
    const s = localStorage.getItem(key);
    if (!s) return { lastPage: 0, bookmarks: [], notes: [] };
    return JSON.parse(s);
  } catch {
    return { lastPage: 0, bookmarks: [], notes: [] };
  }
}

function save(key: string, data: Stored) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export function useReadingProgress(namespace: string) {
  const [state, setState] = useState<Stored>(() => load(namespace));

  useEffect(() => {
    save(namespace, state);
  }, [namespace, state]);

  const setLastPage = (page: number) => setState((s) => ({ ...s, lastPage: page }));
  const toggleBookmark = (page: number) => setState((s) => {
    const set = new Set(s.bookmarks);
    set.has(page) ? set.delete(page) : set.add(page);
    return { ...s, bookmarks: Array.from(set).sort((a, b) => a - b) };
  });
  const addNote = (page: number, text: string) => setState((s) => ({ ...s, notes: [...s.notes, { page, text, at: Date.now() }] }));

  return {
    lastPage: state.lastPage,
    bookmarks: state.bookmarks,
    notes: state.notes,
    setLastPage,
    toggleBookmark,
    addNote,
  };
}
