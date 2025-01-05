import {
  component$,
  useSignal,
  $,
  useTask$,
  useOnDocument,
} from "@builder.io/qwik";
import { useNavigate, useLocation, server$ } from "@builder.io/qwik-city";
import { DocumentHead } from "@builder.io/qwik-city";

interface Recommendation {
  message: string;
  severity: 'error' | 'warning' | 'info' | 'potential';
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
    status: '✅ All Good' | '⚠️ Some Issues' | '❌ Major Issues';
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
  const result = useSignal<RobotsAnalysisResult | null>(null);
  const error = useSignal("");
  const isLoading = useSignal(false);
  const navigate = useNavigate();
  const location = useLocation();

  const analyzeRobotsTxtFile = $(async (inputUrl: string) => {
    isLoading.value = true;
    error.value = "";
    result.value = null;

    try {
      const data = await analyzeRobotsTxt(inputUrl);
      if (data && 'error' in data) {
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
    <div class="max-w-3xl mx-auto px-4 sm:px-6">
      <div class="mb-8 sm:mb-12">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 mb-4">
          Analyze Your Robots.txt
        </h1>
        <p class="text-base sm:text-lg text-gray-600 mb-6">
          Enter your website URL below to analyze your robots.txt file. We'll help you understand how search engines interact with your site and identify potential issues.
        </p>
      </div>

      <div class="mb-6 sm:mb-8">
        <div class="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            bind:value={url}
            placeholder="Enter website URL"
            class="w-full flex-grow rounded-full border border-gray-300 px-4 sm:px-6 py-3 sm:py-4 text-base shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-gray-400 focus:border-black focus:ring-1 focus:ring-black focus:shadow-none transition-all"
          />
          <button
            onClick$={() => analyzeRobotsTxtFile(url.value)}
            class="w-full sm:w-auto rounded-full bg-black px-8 py-3 sm:py-4 text-base font-semibold text-white shadow-sm hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={isLoading.value}
          >
            {isLoading.value ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>

      {error.value && (
        <div class="mb-6 sm:mb-8 rounded-2xl border border-red-200 bg-red-50 px-4 sm:px-6 py-3 sm:py-4 text-sm text-red-600">
          {error.value}
        </div>
      )}

      {isLoading.value && (
        <div class="flex justify-center py-8 sm:py-12">
          <div class="h-8 w-8 animate-spin rounded-full border-[3px] border-black border-t-transparent"></div>
        </div>
      )}

      {result.value && (
        <div class="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl sm:text-2xl font-semibold text-gray-900">Analysis Results</h2>
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
                <span class="text-sm text-gray-600">Score: {result.value.summary.score}/100</span>
              </div>
              <div class="flex gap-2">
                <button
                  onClick$={() => {
                    const blob = new Blob([result.value?.export.jsonData || ''], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `robots-analysis-${new Date().toISOString()}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  class="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Export JSON
                </button>
                <button
                  onClick$={() => {
                    const blob = new Blob([result.value?.export.csvData || ''], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `robots-analysis-${new Date().toISOString()}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  class="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 gap-6">
            {/* Summary Card */}
            <div class="rounded-2xl bg-white border border-gray-200 overflow-hidden">
              <div class="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h3 class="text-base font-semibold text-gray-900">Summary</h3>
              </div>
              <div class="px-4 py-3">
                <dl class="space-y-2 text-sm text-gray-700">
                  <div>
                    <dt class="inline font-medium">Total Rules:</dt>
                    <dd class="inline ml-1">{result.value.summary.totalRules}</dd>
                  </div>
                  <div>
                    <dt class="inline font-medium">Global Rule:</dt>
                    <dd class="inline ml-1">{result.value.summary.hasGlobalRule ? '✅ Present' : '❌ Missing'}</dd>
                  </div>
                  <div>
                    <dt class="inline font-medium">Total Sitemaps:</dt>
                    <dd class="inline ml-1">{result.value.summary.totalSitemaps}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Rules Card */}
            <div class="rounded-2xl bg-white border border-gray-200 overflow-hidden">
              <div class="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h3 class="text-base font-semibold text-gray-900">Crawler Rules</h3>
              </div>
              <div class="divide-y divide-gray-200">
                {result.value.rules.map((rule, index) => (
                  <div key={index} class="px-4 py-3">
                    <h4 class="font-medium text-sm mb-2">
                      {rule.isGlobal ? '🌐 Global Rule' : `🤖 ${rule.userAgent}`}
                    </h4>
                    {rule.disallowedPaths.length > 0 && (
                      <div class="mb-2">
                        <p class="text-sm font-medium text-gray-700">Disallowed Paths:</p>
                        <ul class="mt-1 space-y-1 text-sm text-gray-600">
                          {rule.disallowedPaths.map((path, i) => (
                            <li key={i} class="ml-4">
                              <a href={new URL(path, result.value.url).toString()} 
                                 target="_blank" 
                                 rel="noopener noreferrer" 
                                 class="hover:underline">
                                • {path}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {rule.allowedPaths.length > 0 && (
                      <div class="mb-2">
                        <p class="text-sm font-medium text-gray-700">Allowed Paths:</p>
                        <ul class="mt-1 space-y-1 text-sm text-gray-600">
                          {rule.allowedPaths.map((path, i) => (
                            <li key={i} class="ml-4">
                              <a href={new URL(path, result.value.url).toString()} 
                                 target="_blank" 
                                 rel="noopener noreferrer" 
                                 class="hover:underline">
                                • {path}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {rule.crawlDelay && (
                      <p class="text-sm text-gray-600">
                        <span class="font-medium">⏱️ Crawl Delay:</span> {rule.crawlDelay} seconds
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sitemaps Card */}
            {result.value.sitemaps.urls.length > 0 && (
              <div class="rounded-2xl bg-white border border-gray-200 overflow-hidden">
                <div class="border-b border-gray-200 bg-gray-50 px-4 py-3">
                  <h3 class="text-base font-semibold text-gray-900">🗺️ Sitemaps</h3>
                </div>
                <div class="px-4 py-3">
                  <ul class="space-y-2 text-sm text-gray-600">
                    {result.value.sitemaps.urls.map((sitemap, index) => {
                      const isXml = sitemap.toLowerCase().endsWith('.xml');
                      const isAbsolute = sitemap.startsWith('http');
                      const sitemapUrl = isAbsolute ? sitemap : new URL(sitemap, result.value.url).toString();
                      
                      return (
                        <li key={index} class="flex items-start gap-2">
                          <span class="mt-0.5">•</span>
                          <div class="flex-1">
                            <a 
                              href={sitemapUrl}
                              target="_blank" 
                              rel="noopener noreferrer" 
                              class="text-black hover:underline break-all"
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
                    <div class="mt-3 pt-3 border-t border-gray-200">
                      <p class="text-sm font-medium text-red-600">Issues Found:</p>
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
            <div class="rounded-2xl bg-white border border-gray-200 overflow-hidden">
              <div class="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h3 class="text-base font-semibold text-gray-900">
                  {result.value.recommendations.length === 0 ? '✅ No Issues Found' : '📋 Recommendations'}
                </h3>
              </div>
              <div class="px-4 py-3">
                {result.value.recommendations.length === 0 ? (
                  <p class="text-sm text-gray-600">Great job! Your robots.txt follows best practices.</p>
                ) : (
                  <ul class="space-y-3 text-sm">
                    {result.value.recommendations.map((rec, index) => (
                      <li key={index} class="flex gap-2">
                        <span class="flex-shrink-0">
                          {rec.severity === 'error' ? '❌' : 
                           rec.severity === 'warning' ? '⚠️' : 
                           rec.severity === 'potential' ? '❓' : 'ℹ️'}
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
            <details class="rounded-2xl bg-white border border-gray-200 overflow-hidden group">
              <summary class="cursor-pointer border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between [&::-webkit-details-marker]:hidden">
                <h3 class="text-base font-semibold text-gray-900">📄 Raw robots.txt Content</h3>
                <span class="text-gray-500 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div class="px-4 py-3">
                <pre class="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                  {result.value?.raw_content}
                </pre>
              </div>
            </details>
          </div>
        </div>
      )}

      {!result.value && !isLoading.value && (
        <div class="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
          <div class="rounded-2xl border border-gray-200 p-6">
            <h3 class="text-lg font-semibold mb-2">What We Check</h3>
            <ul class="space-y-2 text-gray-600">
              <li>• Syntax validation</li>
              <li>• User-agent declarations</li>
              <li>• Allow and Disallow rules</li>
              <li>• Sitemap declarations</li>
              <li>• Common configuration issues</li>
            </ul>
          </div>
          <div class="rounded-2xl border border-gray-200 p-6">
            <h3 class="text-lg font-semibold mb-2">Why It Matters</h3>
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
      content: "Analyze your robots.txt file instantly with our free tool. Get detailed insights, validate syntax, and improve your website's SEO performance.",
    },
    {
      name: "keywords",
      content: "robots.txt analyzer, SEO tool, website crawler, robots.txt validator, SEO analysis, web crawling",
    },
    {
      property: "og:title",
      content: "Analyze Your Robots.txt File - Free Online Tool",
    },
    {
      property: "og:description",
      content: "Analyze your robots.txt file instantly with our free tool. Get detailed insights, validate syntax, and improve your website's SEO performance.",
    },
    {
      name: "twitter:title",
      content: "Analyze Your Robots.txt File - Free Online Tool",
    },
    {
      name: "twitter:description",
      content: "Analyze your robots.txt file instantly with our free tool. Get detailed insights, validate syntax, and improve your website's SEO performance.",
    },
  ],
};
