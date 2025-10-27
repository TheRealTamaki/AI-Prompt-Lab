"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Link from "next/link";

type Stats = {
  totalPrompts: number;
  pinnedPrompts: number;
  archivedPrompts: number;
};

type Prompt = {
  id: string;
  title: string;
  description: string | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({
    totalPrompts: 0,
    pinnedPrompts: 0,
    archivedPrompts: 0,
  });
  const [recentPrompts, setRecentPrompts] = useState<Prompt[]>([]);
  const [pinnedPrompts, setPinnedPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);

    try {
      // Fetch recent prompts
      const recentResponse = await fetch("/api/prompts?limit=5&sortBy=createdAt&sortOrder=desc");
      const recentData = await recentResponse.json();

      // Fetch pinned prompts
      const pinnedResponse = await fetch("/api/prompts?isPinned=true&limit=5");
      const pinnedData = await pinnedResponse.json();

      // Fetch archived count
      const archivedResponse = await fetch("/api/prompts?isArchived=true&limit=1");
      const archivedData = await archivedResponse.json();

      if (recentResponse.ok) {
        setRecentPrompts(recentData.prompts);
        setStats((prev) => ({
          ...prev,
          totalPrompts: recentData.pagination.total,
        }));
      }

      if (pinnedResponse.ok) {
        setPinnedPrompts(pinnedData.prompts);
        setStats((prev) => ({
          ...prev,
          pinnedPrompts: pinnedData.pagination.total,
        }));
      }

      if (archivedResponse.ok) {
        setStats((prev) => ({
          ...prev,
          archivedPrompts: archivedData.pagination.total,
        }));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <div className="flex items-center gap-8">
                <h1 className="text-xl font-bold text-gray-900">
                  AI Prompt Lab
                </h1>
                <div className="hidden sm:flex gap-4">
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 py-5"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/prompts"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 py-5"
                  >
                    Prompts
                  </Link>
                  <Link
                    href="/workflows"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 py-5"
                  >
                    Workflows
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  {session?.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome, {session?.user?.name || session?.user?.email}!
            </h2>
            <p className="mt-2 text-gray-600">
              Manage your AI prompts and workflows in one place.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Link
              href="/prompts"
              className="rounded-lg bg-white p-6 shadow hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Prompts</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {isLoading ? "..." : stats.totalPrompts}
                  </p>
                </div>
                <svg
                  className="w-12 h-12 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </Link>

            <Link
              href="/prompts?isPinned=true"
              className="rounded-lg bg-white p-6 shadow hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pinned Prompts</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {isLoading ? "..." : stats.pinnedPrompts}
                  </p>
                </div>
                <svg
                  className="w-12 h-12 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </Link>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Workflows</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
                  <p className="mt-1 text-xs text-gray-500">Coming soon</p>
                </div>
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/prompts/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Prompt
              </Link>
              <Link
                href="/prompts"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Browse Prompts
              </Link>
            </div>
          </div>

          {/* Recent and Pinned Prompts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Prompts */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Prompts
                </h3>
                <Link
                  href="/prompts"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View all
                </Link>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : recentPrompts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No prompts yet</p>
                  <Link
                    href="/prompts/new"
                    className="mt-2 inline-block text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Create your first prompt
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPrompts.map((prompt) => (
                    <Link
                      key={prompt.id}
                      href={`/prompts/${prompt.id}`}
                      className="block p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {prompt.title}
                          </p>
                          {prompt.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {prompt.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(prompt.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {prompt.isPinned && (
                          <svg
                            className="w-4 h-4 text-yellow-500 flex-shrink-0 ml-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Pinned Prompts */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pinned Prompts
                </h3>
                <Link
                  href="/prompts?isPinned=true"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View all
                </Link>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : pinnedPrompts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No pinned prompts</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Pin your favorite prompts for quick access
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pinnedPrompts.map((prompt) => (
                    <Link
                      key={prompt.id}
                      href={`/prompts/${prompt.id}`}
                      className="block p-3 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition"
                    >
                      <div className="flex items-start gap-2">
                        <svg
                          className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {prompt.title}
                          </p>
                          {prompt.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {prompt.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
