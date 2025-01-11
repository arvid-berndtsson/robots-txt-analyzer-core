import { component$, useResource$, Resource } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import { HistoryList } from "~/components/history-list/history-list";

export default component$(() => {
  const resource = useResource$<void>(async () => {
    // This resource will be resolved when the component is mounted
    // allowing instant navigation while content loads
  });

  return (
    <div class="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-8 text-center">
        <h1 class="mb-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Recent Analyses
        </h1>
        <p class="text-base text-gray-500">
          View recent robots.txt analyses from various websites.
        </p>
      </div>

      <Resource
        value={resource}
        onPending={() => (
          <div class="flex items-center justify-center py-12">
            <div class="h-8 w-8 animate-spin rounded-full border-[3px] border-black border-t-transparent"></div>
          </div>
        )}
        onResolved={() => <HistoryList />}
      />
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
