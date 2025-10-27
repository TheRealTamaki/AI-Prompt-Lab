"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Link from "next/link";

type Prompt = {
  id: string;
  title: string;
  description: string | null;
  content: string;
  version: number;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
  tags: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
  workflows: Array<{
    id: string;
    name: string;
  }>;
  isPinnedByUser: boolean;
};

export default function PromptDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPrompt();
  }, [params.id]);

  const fetchPrompt = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/prompts/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch prompt");
      }

      setPrompt(data.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this prompt?")) return;

    try {
      const response = await fetch(`/api/prompts/${params.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || data.error || "Failed to delete prompt");
        return;
      }

      router.push("/prompts");
    } catch (err) {
      alert("Failed to delete prompt");
    }
  };

  const handleCopyContent = () => {
    if (!prompt) return;

    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTogglePin = async () => {
    if (!prompt) return;

    try {
      const response = await fetch(`/api/prompts/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !prompt.isPinned }),
      });

      if (!response.ok) {
        throw new Error("Failed to update prompt");
      }

      fetchPrompt();
    } catch (err) {
      alert("Failed to update prompt");
    }
  };

  const handleToggleArchive = async () => {
    if (!prompt) return;

    try {
      const response = await fetch(`/api/prompts/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: !prompt.isArchived }),
      });

      if (!response.ok) {
        throw new Error("Failed to update prompt");
      }

      fetchPrompt();
    } catch (err) {
      alert("Failed to update prompt");
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !prompt) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error || "Prompt not found"}
            </h1>
            <Link
              href="/prompts"
              className="text-blue-600 hover:text-blue-700"
            >
              Back to Prompts
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <nav className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <div className="flex items-center gap-8">
                <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                  AI Prompt Lab
                </Link>
              </div>
              <Link
                href="/prompts"
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Back to Prompts
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header with Actions */}
          <div className="mb-6 flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                {prompt.isPinned && (
                  <svg
                    className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{prompt.title}</h1>
                  {prompt.isArchived && (
                    <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                      Archived
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={handleTogglePin}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                {prompt.isPinned ? "Unpin" : "Pin"}
              </button>
              <Link
                href={`/prompts/${prompt.id}/edit`}
                className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
              >
                Edit
              </Link>
              <button
                onClick={handleToggleArchive}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                {prompt.isArchived ? "Unarchive" : "Archive"}
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 transition"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Version</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  v{prompt.version}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {new Date(prompt.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {new Date(prompt.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Used in Workflows</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {prompt.workflows.length}
                </p>
              </div>
            </div>

            {/* Category */}
            {prompt.category && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Category</p>
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: prompt.category.color || "#e5e7eb",
                    color: "#374151",
                  }}
                >
                  {prompt.category.icon && <span className="mr-1">{prompt.category.icon}</span>}
                  {prompt.category.name}
                </span>
              </div>
            )}

            {/* Tags */}
            {prompt.tags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {prompt.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 text-sm rounded-full"
                      style={{
                        backgroundColor: tag.color || "#f3f4f6",
                        color: "#1f2937",
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Workflows */}
            {prompt.workflows.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Used in Workflows</p>
                <div className="space-y-1">
                  {prompt.workflows.map((workflow) => (
                    <Link
                      key={workflow.id}
                      href={`/workflows/${workflow.id}`}
                      className="block text-sm text-blue-600 hover:text-blue-700"
                    >
                      {workflow.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {prompt.description && (
            <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Description
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {prompt.description}
              </p>
            </div>
          )}

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Prompt Content
              </h2>
              <button
                onClick={handleCopyContent}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="bg-gray-50 rounded-md p-4 font-mono text-sm text-gray-900 whitespace-pre-wrap border border-gray-200">
              {prompt.content}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {prompt.content.length} characters
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
