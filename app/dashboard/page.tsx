"use client";

import { useSession, signOut } from "next-auth/react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  AI Prompt Lab
                </h1>
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
              Your authentication module is successfully set up.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900">
                Prompts
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Manage your AI prompts (Coming soon)
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900">
                Workflows
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Create multi-step workflows (Coming soon)
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900">
                RICECO Generator
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Generate structured prompts (Coming soon)
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
