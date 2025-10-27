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
  categoryId: string | null;
};

export default function EditPromptPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    categoryId: "",
    isPinned: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

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
      setFormData({
        title: data.prompt.title,
        description: data.prompt.description || "",
        content: data.prompt.content,
        categoryId: data.prompt.categoryId || "",
        isPinned: data.prompt.isPinned,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/prompts/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          content: formData.content,
          categoryId: formData.categoryId || null,
          isPinned: formData.isPinned,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update prompt");
      }

      router.push(`/prompts/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
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

  if (error && !prompt) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
            <Link href="/prompts" className="text-blue-600 hover:text-blue-700">
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
                href={`/prompts/${params.id}`}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Cancel
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Prompt</h1>
            <p className="mt-1 text-sm text-gray-600">
              Make changes to your prompt
              {prompt && prompt.content !== formData.content && (
                <span className="ml-2 text-blue-600">
                  (Version will increment to v{prompt.version + 1})
                </span>
              )}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
            {/* Title */}
            <div className="mb-6">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter prompt title"
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of this prompt (optional)"
              />
            </div>

            {/* Content */}
            <div className="mb-6">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Prompt Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                required
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Enter your prompt text here..."
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.content.length} characters
              </p>
            </div>

            {/* Pin Option */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={(e) =>
                    setFormData({ ...formData, isPinned: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Pin this prompt for quick access
                </span>
              </label>
            </div>

            {/* Version Info */}
            {prompt && (
              <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Current version:</span>
                  <span className="font-semibold text-gray-900">v{prompt.version}</span>
                </div>
                {prompt.content !== formData.content && (
                  <p className="mt-2 text-xs text-blue-600">
                    Content has been modified. Version will increment on save.
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Link
                href={`/prompts/${params.id}`}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}
