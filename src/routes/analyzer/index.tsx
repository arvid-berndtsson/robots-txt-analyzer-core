import { component$, useSignal, $, useTask$ } from "@builder.io/qwik";
import { useNavigate, server$, useLocation } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";

interface Recommendation {
  message: string;
  severity: "error" | "warning" | "info" | "potential";
  details?: string;
}

interface RobotsAnalysisResult {
  url: string;
  robotsUrl: string;
  timestamp: string;
  rules: Array<{
    userAgent: string;
    isGlobal: boolean;
    disallowedPaths: string[];
    allowedPaths: string[];
    crawlDelay?: number;
  }>;
  summary: {
    totalRules: number;
    hasGlobalRule: boolean;
    totalSitemaps: number;
    score: number;
    status: "✅ All Good" | "⚠️ Some Issues" | "❌ Major Issues";
  };
  sitemaps: {
    urls: string[];
    issues: string[];
  };
  recommendations: Recommendation[];
  urls: {
    allowed: string[];
    blocked: string[];
  };
  raw_content: string;
  export: {
    jsonData: string;
    csvData: string;
  };
}

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
  const result = useSignal<RobotsAnalysisResult | null>(null);
  const error = useSignal("");
  const isLoading = useSignal(false);
  const navigate = useNavigate();
  const location = useLocation();

  const analyzeRobotsTxtFile = $(async (inputUrl: string) => {
    if (!inputUrl) return;

    isLoading.value = true;
    error.value = "";
    result.value = null;

    try {
      const data = await analyzeRobotsTxt(inputUrl);
      if (data && "error" in data) {
        throw new Error(data.error);
      }
      result.value = data as RobotsAnalysisResult;

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

  // Watch for URL parameter changes
  useTask$(({ track }) => {
    const urlParam = track(() => location.url.searchParams.get("url"));
    if (urlParam && urlParam !== url.value) {
      url.value = urlParam;
      analyzeRobotsTxtFile(urlParam);
    }
  });

  return (
    <div class="mx-auto max-w-3xl px-4 sm:px-6">
      <div class="mb-8 sm:mb-12">
        <h1 class="mb-4 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
          Analyze Your Robots.txt
        </h1>
        <p class="mb-6 text-base text-gray-600 sm:text-lg">
          Enter your website URL below to analyze your robots.txt file. We'll
          help you understand how search engines interact with your site and
          identify potential issues.
        </p>
      </div>

      <div class="mb-6 sm:mb-8">
        <div class="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            bind:value={url}
            placeholder="Enter website URL"
            onKeyPress$={(event) => {
              if (event.key === "Enter") {
                analyzeRobotsTxtFile(url.value);
              }
            }}
            class="w-full flex-grow rounded-full border border-gray-300 px-4 py-3 text-base shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:border-gray-400 focus:border-black focus:shadow-none focus:ring-1 focus:ring-black sm:px-6 sm:py-4"
          />
          <button
            onClick$={() => analyzeRobotsTxtFile(url.value)}
            class="w-full rounded-full bg-black px-8 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto sm:py-4"
            disabled={isLoading.value}
          >
            {isLoading.value ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>

      {error.value && (
        <div class="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 sm:mb-8 sm:px-6 sm:py-4">
          {error.value}
        </div>
      )}

      {isLoading.value && (
        <div class="flex justify-center py-8 sm:py-12">
          <div class="h-8 w-8 animate-spin rounded-full border-[3px] border-black border-t-transparent"></div>
        </div>
      )}

      {result.value && (
        <div class="mt-6 space-y-4 sm:mt-8 sm:space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-gray-900 sm:text-2xl">
                Analysis Results
              </h2>
              <a
                href={result.value.robotsUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-gray-600 hover:text-black hover:underline"
              >
                View robots.txt
              </a>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <span class="text-lg">{result.value.summary.status}</span>
                <span class="text-sm text-gray-600">
                  Score: {result.value.summary.score}/100
                </span>
              </div>
              <div class="flex gap-2">
                <button
                  preventdefault:click
                  onClick$={$(() => {
                    try {
                      const data = result.value!;
                      const blob = new Blob([data.export.jsonData], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `robots-analysis-${new Date().toISOString()}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error("Failed to export JSON:", error);
                    }
                  })}
                  class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 active:scale-95 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!result.value.export.jsonData}
                >
                  Export JSON
                </button>
                <button
                  preventdefault:click
                  onClick$={$(() => {
                    try {
                      const data = result.value!;
                      const blob = new Blob([data.export.csvData], {
                        type: "text/csv",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `robots-analysis-${new Date().toISOString()}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error("Failed to export CSV:", error);
                    }
                  })}
                  class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 active:scale-95 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!result.value.export.csvData}
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-6">
            {/* Summary Card */}
            <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div class="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h3 class="text-base font-semibold text-gray-900">Summary</h3>
              </div>
              <div class="px-4 py-3">
                <dl class="space-y-2 text-sm text-gray-700">
                  <div>
                    <dt class="inline font-medium">Total Rules:</dt>
                    <dd class="ml-1 inline">
                      {result.value.summary.totalRules}
                    </dd>
                  </div>
                  <div>
                    <dt class="inline font-medium">Global Rule:</dt>
                    <dd class="ml-1 inline">
                      {result.value.summary.hasGlobalRule
                        ? "✅ Present"
                        : "❌ Missing"}
                    </dd>
                  </div>
                  <div>
                    <dt class="inline font-medium">Total Sitemaps:</dt>
                    <dd class="ml-1 inline">
                      {result.value.summary.totalSitemaps}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Rules Card */}
            <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div class="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h3 class="text-base font-semibold text-gray-900">
                  Crawler Rules
                </h3>
              </div>
              <div class="divide-y divide-gray-200">
                {result.value.rules.map((rule, index) => (
                  <div key={index} class="px-4 py-3">
                    <h4 class="mb-2 text-sm font-medium">
                      {rule.isGlobal
                        ? "🌐 Global Rule"
                        : `🤖 ${rule.userAgent}`}
                    </h4>
                    {rule.disallowedPaths.length > 0 && (
                      <div class="mb-2">
                        <p class="text-sm font-medium text-gray-700">
                          Disallowed Paths:
                        </p>
                        <ul class="mt-1 space-y-1 text-sm text-gray-600">
                          {rule.disallowedPaths.map((path, i) => (
                            <li key={i} class="ml-4">
                              <a
                                href={new URL(
                                  path,
                                  (result.value as RobotsAnalysisResult).url,
                                ).toString()}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="hover:underline"
                              >
                                • {path}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {rule.allowedPaths.length > 0 && (
                      <div class="mb-2">
                        <p class="text-sm font-medium text-gray-700">
                          Allowed Paths:
                        </p>
                        <ul class="mt-1 space-y-1 text-sm text-gray-600">
                          {rule.allowedPaths.map((path, i) => (
                            <li key={i} class="ml-4">
                              <a
                                href={new URL(
                                  path,
                                  (result.value as RobotsAnalysisResult).url,
                                ).toString()}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="hover:underline"
                              >
                                • {path}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {rule.crawlDelay && (
                      <p class="text-sm text-gray-600">
                        <span class="font-medium">⏱️ Crawl Delay:</span>{" "}
                        {rule.crawlDelay} seconds
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sitemaps Card */}
            {result.value.sitemaps.urls.length > 0 && (
              <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div class="border-b border-gray-200 bg-gray-50 px-4 py-3">
                  <h3 class="text-base font-semibold text-gray-900">
                    🗺️ Sitemaps
                  </h3>
                </div>
                <div class="px-4 py-3">
                  <ul class="space-y-2 text-sm text-gray-600">
                    {result.value.sitemaps.urls.map((sitemap, index) => {
                      const isXml = sitemap.toLowerCase().endsWith(".xml");
                      const isAbsolute = sitemap.startsWith("http");
                      const sitemapUrl = isAbsolute
                        ? sitemap
                        : new URL(
                            sitemap,
                            (result.value as RobotsAnalysisResult).url,
                          ).toString();

                      return (
                        <li key={index} class="flex items-start gap-2">
                          <span class="mt-0.5">•</span>
                          <div class="flex-1">
                            <a
                              href={sitemapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              class="break-all text-black hover:underline"
                            >
                              {sitemap}
                            </a>
                            <div class="mt-1 flex flex-wrap gap-2">
                              {!isXml && (
                                <span class="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                  Not XML format
                                </span>
                              )}
                              {!isAbsolute && (
                                <span class="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                  Relative URL
                                </span>
                              )}
                              <a
                                href={`https://validator.w3.org/feed/check.cgi?url=${encodeURIComponent(sitemapUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 hover:bg-gray-100"
                              >
                                Validate
                              </a>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  {result.value.sitemaps.issues.length > 0 && (
                    <div class="mt-3 border-t border-gray-200 pt-3">
                      <p class="text-sm font-medium text-red-600">
                        Issues Found:
                      </p>
                      <ul class="mt-1 space-y-1 text-sm text-red-600">
                        {result.value.sitemaps.issues.map((issue, index) => (
                          <li key={index}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recommendations Card */}
            <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div class="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h3 class="text-base font-semibold text-gray-900">
                  {result.value.recommendations.length === 0
                    ? "✅ No Issues Found"
                    : "📋 Recommendations"}
                </h3>
              </div>
              <div class="px-4 py-3">
                {result.value.recommendations.length === 0 ? (
                  <p class="text-sm text-gray-600">
                    Great job! Your robots.txt follows best practices.
                  </p>
                ) : (
                  <ul class="space-y-3 text-sm">
                    {result.value.recommendations.map((rec, index) => (
                      <li key={index} class="flex gap-2">
                        <span class="flex-shrink-0">
                          {rec.severity === "error"
                            ? "❌"
                            : rec.severity === "warning"
                              ? "⚠️"
                              : rec.severity === "potential"
                                ? "❓"
                                : "ℹ️"}
                        </span>
                        <div>
                          <p class="font-medium text-gray-900">{rec.message}</p>
                          {rec.details && (
                            <p class="mt-1 text-gray-600">{rec.details}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Raw Content Toggle */}
            <details class="group overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <summary class="flex cursor-pointer items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 [&::-webkit-details-marker]:hidden">
                <h3 class="text-base font-semibold text-gray-900">
                  📄 Raw robots.txt Content
                </h3>
                <span class="text-gray-500 transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <div class="px-4 py-3">
                <pre class="whitespace-pre-wrap font-mono text-sm text-gray-700">
                  {result.value.raw_content}
                </pre>
              </div>
            </details>
          </div>
        </div>
      )}

      {!result.value && !isLoading.value && (
        <div class="mt-12 grid grid-cols-1 gap-6 text-left sm:mt-16 sm:grid-cols-2">
          <div class="rounded-2xl border border-gray-200 p-6">
            <h3 class="mb-2 text-lg font-semibold">What We Check</h3>
            <ul class="space-y-2 text-gray-600">
              <li>• Syntax validation</li>
              <li>• User-agent declarations</li>
              <li>• Allow and Disallow rules</li>
              <li>• Sitemap declarations</li>
              <li>• Common configuration issues</li>
            </ul>
          </div>
          <div class="rounded-2xl border border-gray-200 p-6">
            <h3 class="mb-2 text-lg font-semibold">Why It Matters</h3>
            <ul class="space-y-2 text-gray-600">
              <li>• Improve search engine crawling</li>
              <li>• Protect sensitive content</li>
              <li>• Optimize crawl budget</li>
              <li>• Enhance SEO performance</li>
              <li>• Prevent indexing issues</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "Analyze Your Robots.txt File - Free Online Tool",
  meta: [
    {
      name: "description",
      content:
        "Analyze your robots.txt file instantly with our free tool. Get detailed insights, validate syntax, and improve your website's SEO performance.",
    },
    {
      name: "keywords",
      content:
        "robots.txt analyzer, SEO tool, website crawler, robots.txt validator, SEO analysis, web crawling",
    },
    {
      property: "og:title",
      content: "Analyze Your Robots.txt File - Free Online Tool",
    },
    {
      property: "og:description",
      content:
        "Analyze your robots.txt file instantly with our free tool. Get detailed insights, validate syntax, and improve your website's SEO performance.",
    },
    {
      name: "twitter:title",
      content: "Analyze Your Robots.txt File - Free Online Tool",
    },
    {
      name: "twitter:description",
      content:
        "Analyze your robots.txt file instantly with our free tool. Get detailed insights, validate syntax, and improve your website's SEO performance.",
    },
  ],
};
