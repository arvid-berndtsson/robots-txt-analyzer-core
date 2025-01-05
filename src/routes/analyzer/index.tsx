import {
  component$,
  useSignal,
  $,
  useTask$,
  useOnDocument,
} from "@builder.io/qwik";
import { useNavigate, useLocation, server$ } from "@builder.io/qwik-city";

const analyzeRobotsTxt = server$(async function (inputUrl: string) {
  const origin = this.env.get("ORIGIN");
  const apiKey = this.env.get("API_KEY");

  if (!origin) {
    throw new Error("ORIGIN environment variable is not configured");
  }
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not configured");
  }

  const response = await fetch(`${origin}/api/v1/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({ url: inputUrl }),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze robots.txt");
  }

  return await response.json();
});

export default component$(() => {
  const url = useSignal("");
  const result = useSignal("");
  const error = useSignal("");
  const isLoading = useSignal(false);
  const navigate = useNavigate();
  const location = useLocation();

  const analyzeRobotsTxtFile = $(async (inputUrl: string) => {
    isLoading.value = true;
    error.value = "";
    result.value = "";

    try {
      const data = await analyzeRobotsTxt(inputUrl);
      result.value = data.analysis;

      // Update URL without reloading the page
      navigate(`/analyzer?url=${encodeURIComponent(inputUrl)}`, {
        replaceState: true,
      });
    } catch (err: unknown) {
      console.error("Error:", err);
      error.value =
        err instanceof Error ? err.message : "An unknown error occurred";
    } finally {
      isLoading.value = false;
    }
  });

  useTask$(({ track }) => {
    const urlParam = track(() => location.url.searchParams.get("url"));
    if (urlParam) {
      url.value = urlParam;
      analyzeRobotsTxtFile(urlParam);
    }
  });

  useOnDocument(
    "DOMContentLoaded",
    $(() => {
      const urlParam = new URLSearchParams(window.location.search).get("url");
      if (urlParam) {
        url.value = urlParam;
        analyzeRobotsTxtFile(urlParam);
      }
    }),
  );

  return (
    <div class="max-w-3xl mx-auto">
      <h1 class="text-4xl font-semibold tracking-tight text-gray-900 mb-8">Analyze Your Robots.txt</h1>
      <div class="mb-8">
        <div class="flex gap-2">
          <input
            type="text"
            bind:value={url}
            placeholder="Enter website URL (e.g., example.com)"
            class="flex-grow rounded-full border border-gray-300 px-6 py-4 text-base shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-gray-400 focus:border-black focus:ring-1 focus:ring-black focus:shadow-none transition-all"
          />
          <button
            onClick$={() => analyzeRobotsTxtFile(url.value)}
            class="rounded-full bg-black px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={isLoading.value}
          >
            {isLoading.value ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>

      {error.value && (
        <div class="mb-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600">
          {error.value}
        </div>
      )}

      {isLoading.value && (
        <div class="flex justify-center py-12">
          <div class="h-8 w-8 animate-spin rounded-full border-[3px] border-black border-t-transparent"></div>
        </div>
      )}

      {result.value && (
        <div class="mt-8 space-y-6">
          <h2 class="text-2xl font-semibold text-gray-900">Analysis Results</h2>
          <div class="overflow-x-auto rounded-2xl bg-gray-50 p-6">
            <pre class="whitespace-pre-wrap text-sm text-gray-700">
              {result.value}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
});
