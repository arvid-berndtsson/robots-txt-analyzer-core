import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import { type DocumentHead, server$ } from "@builder.io/qwik-city";

interface HistoryEntry {
  url: string;
  domain: string;
  timestamp: string;
}

const fetchHistory = server$(async function() {
  const origin = this.env.get("CF_PAGES_URL") || this.env.get("ORIGIN");
  const apiKey = this.env.get("API_KEY");

  if (!origin) {
    throw new Error("ORIGIN environment variable is not configured");
  }
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not configured");
  }

  const response = await fetch(`${origin}/api/v1/history`, {
    headers: {
      "X-API-Key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch history");
  }

  return await response.json();
});

export default component$(() => {
  const entries = useSignal<HistoryEntry[]>([]);
  const error = useSignal<string | null>(null);
  const isLoading = useSignal(true);

  // Fetch history entries when the component mounts
  useTask$(async () => {
    try {
      const data = await fetchHistory();
      entries.value = data;
    } catch (err) {
      console.error('Error fetching history:', err);
      error.value = err instanceof Error ? err.message : 'Failed to load history. Please try again later.';
    } finally {
      isLoading.value = false;
    }
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Less than a minute ago
    if (diffInSeconds < 60) {
      return "Just now";
    }
    // Less than an hour ago
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }
    // Less than a day ago
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }
    // Less than a week ago
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }

    // For older dates, show a simpler format
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    }).format(date);
  };

  return (
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mb-4">
          Recent Analyses
        </h1>
        <p class="text-base text-gray-500">
          View recent robots.txt analyses from various websites.
        </p>
      </div>

      {isLoading.value ? (
        <div class="flex justify-center items-center py-12">
          <div class="h-8 w-8 animate-spin rounded-full border-[3px] border-black border-t-transparent"></div>
        </div>
      ) : error.value ? (
        <div class="text-center text-red-600 mb-4">{error.value}</div>
      ) : (
        <div class="rounded-2xl border border-gray-200">
          <div class="max-h-[600px] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div class="divide-y divide-gray-200">
              {entries.value.map((entry) => (
                <div key={entry.url + entry.timestamp} class="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center">
                      <span class="text-base text-gray-900">
                        {entry.domain}
                      </span>
                    </div>
                    <p class="text-sm text-gray-500 mt-1">
                      {formatDate(entry.timestamp)}
                    </p>
                  </div>
                  <a
                    href={`/analyzer?url=${entry.url}`}
                    class="ml-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 whitespace-nowrap"
                  >
                    Analyze Again
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "Analysis History - Robots.txt Analyzer",
  meta: [
    {
      name: "description",
      content: "View recent robots.txt analyses and their results.",
    },
    {
      name: "robots",
      content: "noindex",
    },
  ],
};
