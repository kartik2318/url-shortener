'use client';

import { useState, useContext } from 'react';
import { UserContext } from '@/utils/userContext';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  
  const [longUrl, setLongUrl] = useState('');
  const [title, setTitle] = useState('');
  const [created, setCreated] = useState<any>(null);
  const { token } = useContext(UserContext);
  redirect('/login');

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return alert('Please login from /login to create links');

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ long_url: longUrl, title }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || 'Error');
    setCreated(data);
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      {/* HEADER */}
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">
        SimpleShort <span className="text-blue-600">— Shorten URLs Instantly</span>
      </h1>

      {/* CARD CONTAINER */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <form onSubmit={handleCreate} className="space-y-4">
          {/* URL INPUT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Long URL</label>
            <input
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="https://example.com/very/long/url..."
              className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          {/* TITLE INPUT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My portfolio page"
              className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition shadow-sm"
            >
              Shorten URL
            </button>

            <Link
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 border rounded-xl font-medium transition"
              href="/dashboard"
            >
              My Dashboard
            </Link>
          </div>
        </form>
      </div>

      {/* SHORTENED RESULT */}
      {created && (
        <div className="mt-6 bg-gradient-to-br from-white to-gray-50 border rounded-2xl p-5 shadow">
          <h2 className="text-lg font-semibold mb-2">Your shortened link</h2>

          <a
            className="text-blue-600 font-medium hover:underline break-all"
            href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/r/${created.short_id}`}
            target="_blank"
            rel="noreferrer"
          >
            {`${process.env.NEXT_PUBLIC_BACKEND_URL}/r/${created.short_id}`}
          </a>

          <p className="text-sm text-gray-600 mt-2 break-all">
            Original URL: {created.long_url}
          </p>
        </div>
      )}
    </main>
  );
}