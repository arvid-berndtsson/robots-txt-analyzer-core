import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import { server$, Link } from "@builder.io/qwik-city";

interface HistoryEntry {
  url: string;
  domain: string;
  timestamp: string;
}

const fetchHistory = server$(async function () {
  const origin = this.env.get("CF_PAGES_URL") || this.env.get("ORIGIN");
  const apiKey = this.env.get("API_KEY");

  if (!origin || !apiKey) {
    throw new Error("Configuration error");
  }

  const response = await fetch(`${origin}/api/v1/history`, {
    headers: {
      "X-API-Key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch history");
  }

  return response.json() as Promise<HistoryEntry[]>;
});

export const HistoryList = component$(() => {
  const entries = useSignal<HistoryEntry[]>([]);
  const error = useSignal<string | null>(null);

  useTask$(async ({ cleanup }) => {
    const controller = new AbortController();
    cleanup(() => controller.abort());

    try {
      const data = await fetchHistory();
      entries.value = data;
    } catch (err) {
      console.error("Error fetching history:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to load history. Please try again later.";
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
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    }).format(date);
  };

  if (error.value) {
    return <div class="mb-4 text-center text-red-600">{error.value}</div>;
  }

  if (entries.value.length === 0) {
    return (
      <div class="py-8 text-center">
        <p class="text-gray-500">No analysis history found.</p>
      </div>
    );
  }

  return (
    <div class="rounded-2xl border border-gray-200">
      <div class="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 max-h-[600px] overflow-y-auto overscroll-contain">
        <div class="divide-y divide-gray-200">
          {entries.value.map((entry) => (
            <div
              key={entry.url + entry.timestamp}
              class="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div class="min-w-0 flex-1">
                <div class="flex items-center">
                  <span class="text-base text-gray-900">{entry.domain}</span>
                </div>
                <p class="mt-1 text-sm text-gray-500">
                  {formatDate(entry.timestamp)}
                </p>
              </div>
              <Link
                href={`/analyzer?url=${entry.url}`}
                class="ml-4 whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Analyze Again
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
