import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { exampleUrls } from "~/data/example-urls";

const MAX_HISTORY_ITEMS = 25;
const MAX_AGE_MINUTES = 60;

interface HistoryEntry {
  url: string;
  date: string;
}

// Create a new set of random entries
const createNewEntries = (count: number): HistoryEntry[] => {
  const now = new Date();
  return [...exampleUrls]
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map(url => {
      const minutesAgo = Math.floor(Math.random() * MAX_AGE_MINUTES);
      const date = new Date(now.getTime() - minutesAgo * 60000);
      return { url, date: date.toISOString() };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export default component$(() => {
  const entries = createNewEntries(MAX_HISTORY_ITEMS);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mb-4">
          Recent Analyses
        </h1>
        <p class="text-base text-gray-500">
          Example analyses to demonstrate the tool's capabilities.
        </p>
      </div>

      <div class="rounded-2xl border border-gray-200">
        <div class="max-h-[600px] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div class="divide-y divide-gray-200">
            {entries.map((entry) => (
              <div key={entry.url + entry.date} class="flex items-center justify-between p-4 hover:bg-gray-50">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center">
                    <span class="text-base text-gray-900">
                      {entry.url}
                    </span>
                  </div>
                  <p class="text-sm text-gray-500 mt-1">
                    {formatDate(entry.date)}
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

      <p class="mt-8 text-sm text-center text-gray-500">
        Note: These are example entries. The history feature will track actual analyses in the future.
      </p>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Analysis History - Robots.txt Analyzer",
  meta: [
    {
      name: "description",
      content: "View recent robots.txt analyses and explore example analyses from various websites.",
    },
    {
      name: "robots",
      content: "noindex",
    },
  ],
};
