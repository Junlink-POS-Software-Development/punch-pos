"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, ExternalLink, Bookmark } from "lucide-react";
import Link from "next/link";

interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  createdAt: number;
}

export default function BookmarksSection() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("workspace_bookmarks");
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }
  }, []);

  const saveBookmarks = (updated: BookmarkItem[]) => {
    setBookmarks(updated);
    localStorage.setItem("workspace_bookmarks", JSON.stringify(updated));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;

    const newItem: BookmarkItem = {
      id: crypto.randomUUID(),
      title: newTitle,
      url: newUrl.startsWith("http") ? newUrl : `https://${newUrl}`,
      createdAt: Date.now(),
    };

    saveBookmarks([newItem, ...bookmarks]);
    setNewTitle("");
    setNewUrl("");
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    saveBookmarks(bookmarks.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-cyan-400" />
          Bookmarked Works
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Bookmark
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Project Proposal"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">URL</label>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="e.g. docs.google.com/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-slate-400 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newTitle || !newUrl}
              className="px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-sm font-medium hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save Bookmark
            </button>
          </div>
        </form>
      )}

      {bookmarks.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
          <p>No bookmarks yet. Add your frequently used documents here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="group relative bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover:text-cyan-400 transition-colors">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <button
                  onClick={() => handleDelete(bookmark.id)}
                  className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <Link 
                href={bookmark.url} 
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <h3 className="text-white font-medium truncate mb-1 group-hover:text-cyan-400 transition-colors">
                  {bookmark.title}
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  {bookmark.url}
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
