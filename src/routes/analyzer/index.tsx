import {
  component$,
  useSignal,
  $,
  useTask$,
  useOnDocument,
} from "@builder.io/qwik";
import { useNavigate, useLocation, server$ } from "@builder.io/qwik-city";

const analyzeRobotsTxt = server$(async function (inputUrl: string) {
  const origin = this.env.get("CF_PAGES_URL") || this.env.get("ORIGIN");
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
    <div class="container mx-auto p-4">
      <h1 class="mb-4 text-2xl font-bold">Analyze Robots.txt</h1>
      <div class="mb-4 flex">
        <input
          type="text"
          bind:value={url}
          placeholder="Enter website URL"
          class="flex-grow rounded-l border p-2"
        />
        <button
          onClick$={() => analyzeRobotsTxtFile(url.value)}
          class="rounded-r bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading.value}
        >
          {isLoading.value ? "Analyzing..." : "Analyze"}
        </button>
      </div>
      {error.value && (
        <div class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error.value}
        </div>
      )}
      {isLoading.value && (
        <div class="text-center">
          <div class="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
      )}
      {result.value && (
        <div class="mt-4">
          <h2 class="mb-2 text-xl font-semibold">Analysis:</h2>
          <pre class="overflow-x-auto whitespace-pre-wrap rounded bg-gray-100 p-4">
            {result.value}
          </pre>
        </div>
      )}
    </div>
  );
});
