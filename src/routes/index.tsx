import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div class="px-4 text-center sm:px-6">
      <div class="mx-auto max-w-4xl">
        <div class="mb-16">
          <h1 class="mb-4 text-3xl font-semibold tracking-tight text-gray-900 sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
            Robots.txt Analyzer
          </h1>
          <p class="mx-auto mb-8 max-w-2xl text-lg text-gray-600 sm:mb-12 sm:text-xl">
            Understand how search engines interact with your website. Analyze
            your robots.txt file with our powerful, intuitive tool.
          </p>
          <div class="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href="/analyzer"
              class="rounded-full bg-black px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:py-4"
            >
              Start Analyzing
            </a>
            <a
              href="/what-is-robots-txt"
              class="rounded-full bg-white px-8 py-3 text-base font-semibold text-black shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:py-4"
            >
              Learn More
            </a>
          </div>

          {/* Trust Indicators */}
          <div class="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-gray-600">
            <p>✓ 100% Free</p>
            <p>✓ No Registration Required</p>
            <p>✓ Open Source</p>
            <p>✓ Public History</p>
          </div>
        </div>

        <div class="mb-24 grid grid-cols-1 gap-8 text-left md:grid-cols-3">
          <div>
            <h2 class="mb-2 text-lg font-semibold">Instant Analysis</h2>
            <p class="text-gray-600">
              Get immediate insights into your robots.txt file. Understand which
              parts of your site are accessible to search engines.
            </p>
          </div>
          <div>
            <h2 class="mb-2 text-lg font-semibold">SEO Friendly</h2>
            <p class="text-gray-600">
              Ensure your website is properly configured for search engine
              crawlers. Identify and fix potential SEO issues.
            </p>
          </div>
          <div>
            <h2 class="mb-2 text-lg font-semibold">Easy to Use</h2>
            <p class="text-gray-600">
              Simply enter your website URL and get a detailed analysis of your
              robots.txt file. No technical knowledge required.
            </p>
          </div>
        </div>

        {/* Feature Comparison */}
        <div class="mb-24">
          <h2 class="mb-8 text-2xl font-semibold">Why Choose Our Analyzer?</h2>
          <div class="overflow-hidden rounded-2xl border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200 text-left">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-sm font-semibold text-gray-900">
                    Feature
                  </th>
                  <th class="px-6 py-3 text-sm font-semibold text-gray-900">
                    Our Tool
                  </th>
                  <th class="px-6 py-3 text-sm font-semibold text-gray-900">
                    Others
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr>
                  <td class="px-6 py-4 text-sm text-gray-900">Free to Use</td>
                  <td class="px-6 py-4 text-sm text-gray-600">✓</td>
                  <td class="px-6 py-4 text-sm text-gray-600">Varies</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    No Registration
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">✓</td>
                  <td class="px-6 py-4 text-sm text-gray-600">×</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    Detailed Analysis
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">✓</td>
                  <td class="px-6 py-4 text-sm text-gray-600">✓</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    <a
                      href="https://github.com/arvid-berndtsson/robots-txt-analyzer"
                      class="text-black hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Source
                    </a>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">✓</td>
                  <td class="px-6 py-4 text-sm text-gray-600">×</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="mb-24">
          <h2 class="mb-8 text-2xl font-semibold">How It Works</h2>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-4">
            <div class="rounded-2xl bg-gray-50 p-6">
              <div class="mb-2 text-2xl font-semibold">1</div>
              <p class="text-gray-600">Enter your website's URL</p>
            </div>
            <div class="rounded-2xl bg-gray-50 p-6">
              <div class="mb-2 text-2xl font-semibold">2</div>
              <p class="text-gray-600">We fetch your robots.txt file</p>
            </div>
            <div class="rounded-2xl bg-gray-50 p-6">
              <div class="mb-2 text-2xl font-semibold">3</div>
              <p class="text-gray-600">Our tool analyzes the contents</p>
            </div>
            <div class="rounded-2xl bg-gray-50 p-6">
              <div class="mb-2 text-2xl font-semibold">4</div>
              <p class="text-gray-600">View results and recommendations</p>
            </div>
          </div>
        </div>

        <div class="mb-16 rounded-2xl bg-gray-50 p-8">
          <h2 class="mb-4 text-2xl font-semibold">
            Ready to optimize your website?
          </h2>
          <p class="mx-auto mb-6 max-w-2xl text-gray-600">
            Start analyzing your robots.txt file today and ensure your website
            is properly configured for search engines.
          </p>
          <a
            href="/analyzer"
            class="inline-flex items-center rounded-full bg-black px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Robots.txt Analyzer - Optimize Your Website's Crawlability",
  meta: [
    {
      name: "description",
      content:
        "Free online robots.txt analyzer tool. Instantly analyze and validate your robots.txt file to improve SEO and ensure proper search engine crawling.",
    },
    {
      name: "keywords",
      content:
        "robots.txt, SEO tools, website crawler, search engine optimization, robots.txt validator, web crawling",
    },
    {
      property: "og:title",
      content: "Robots.txt Analyzer - Optimize Your Website's Crawlability",
    },
    {
      property: "og:description",
      content:
        "Free online robots.txt analyzer tool. Instantly analyze and validate your robots.txt file to improve SEO and ensure proper search engine crawling.",
    },
    {
      name: "twitter:title",
      content: "Robots.txt Analyzer - Optimize Your Website's Crawlability",
    },
    {
      name: "twitter:description",
      content:
        "Free online robots.txt analyzer tool. Instantly analyze and validate your robots.txt file to improve SEO and ensure proper search engine crawling.",
    },
  ],
};
