// frontend/app/dashboard/page.tsx

"use client";

import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/utils/userContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { token, user, logout } = useContext(UserContext);
  const router = useRouter();

  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user links + click stats
  useEffect(() => {
    if (!token) return;
    
    async function loadLinks() {
      try {
        // 1️⃣ Fetch all links
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/links`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!Array.isArray(data)) return setLoading(false);

        // 2️⃣ For each link, fetch stats (total clicks)
        const linksWithClicks = await Promise.all(
          data.map(async (link) => {
            try {
              const statsRes = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/links/${link.id}/stats`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              const stats = await statsRes.json();
              return { ...link, clicks: stats.totalClicks || 0 };
            } catch {
              return { ...link, clicks: 0 };
            }
          })
        );

        setLinks(linksWithClicks);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }

      setLoading(false);
    }

    loadLinks();
  }, [token]);

  // If no token, show fallback (avoid flicker)
  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center text-center">
        <div>
          <h1 className="text-3xl font-bold mb-3">Dashboard</h1>
          <p className="text-gray-600">Please login to view your dashboard.</p>
          <Link
            href="/login"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">Dashboard</h1>

        <div className="flex gap-3">
    {/* Create Link Button */}
    <button
      onClick={() => router.push("/")}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
    >
      Create Link
    </button>

    {/* Logout Button */}
    <button
      onClick={() => {
        logout();
        router.push("/login");
      }}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition"
    >
      Logout
    </button>
  </div>
      </div>

      {/* Greeting */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-md mb-8">
        <h2 className="text-xl font-semibold">Welcome back 👋</h2>
        <p className="text-blue-100">{user?.email}</p>
      </div>

      {/* Links Section */}
      <h2 className="text-xl font-semibold mb-3">Your Shortened Links</h2>

      {loading && (
        <p className="text-gray-500 animate-pulse">Loading your links...</p>
      )}

      {!loading && links.length === 0 && (
        <div className="text-center bg-gray-100 p-6 rounded-xl">
          <p className="text-gray-700 mb-4 text-lg font-medium">
            You haven’t created any short links yet.
          </p>

          <Link
            href="/"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
          >
            Start Creating Short Links
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {links.map((item) => (
          <div
            key={item.id}
            className="p-5 border rounded-xl bg-white shadow hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold text-lg">
                {item.title || "Untitled Link"}
              </div>

              <span className="text-sm text-gray-500">
                Clicks:{" "}
                <span className="font-bold text-gray-700">
                  {item.clicks ?? 0}
                </span>
              </span>
            </div>

            <div className="mt-2">
              <a
                href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.short_id}`}
                target="_blank"
                className="text-blue-600 hover:underline font-medium"
              >
                {`${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.short_id}`}
              </a>
            </div>

            <div className="text-gray-600 text-sm mt-1 truncate">
              {item.long_url}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
