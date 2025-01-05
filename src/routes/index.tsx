import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div class="text-center px-4 sm:px-6">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 mb-4 sm:mb-6">
          Robots.txt Analyzer
        </h1>
        <p class="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto">
          Understand how search engines interact with your website. Analyze your robots.txt file with our powerful, intuitive tool.
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-16">
          <a
            href="/analyzer"
            class="rounded-full bg-black px-8 py-3 sm:py-4 text-base font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Start Analyzing
          </a>
          <a
            href="/about"
            class="rounded-full bg-white px-8 py-3 sm:py-4 text-base font-semibold text-black shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Learn More
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div>
            <h2 class="text-lg font-semibold mb-2">Instant Analysis</h2>
            <p class="text-gray-600">
              Get immediate insights into your robots.txt file. Understand which parts of your site are accessible to search engines.
            </p>
          </div>
          <div>
            <h2 class="text-lg font-semibold mb-2">SEO Friendly</h2>
            <p class="text-gray-600">
              Ensure your website is properly configured for search engine crawlers. Identify and fix potential SEO issues.
            </p>
          </div>
          <div>
            <h2 class="text-lg font-semibold mb-2">Easy to Use</h2>
            <p class="text-gray-600">
              Simply enter your website URL and get a detailed analysis of your robots.txt file. No technical knowledge required.
            </p>
          </div>
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
      content: "Free online robots.txt analyzer tool. Instantly analyze and validate your robots.txt file to improve SEO and ensure proper search engine crawling.",
    },
    {
      name: "keywords",
      content: "robots.txt, SEO tools, website crawler, search engine optimization, robots.txt validator, web crawling",
    },
    {
      property: "og:title",
      content: "Robots.txt Analyzer - Optimize Your Website's Crawlability",
    },
    {
      property: "og:description",
      content: "Free online robots.txt analyzer tool. Instantly analyze and validate your robots.txt file to improve SEO and ensure proper search engine crawling.",
    },
    {
      name: "twitter:title",
      content: "Robots.txt Analyzer - Optimize Your Website's Crawlability",
    },
    {
      name: "twitter:description",
      content: "Free online robots.txt analyzer tool. Instantly analyze and validate your robots.txt file to improve SEO and ensure proper search engine crawling.",
    },
  ],
};

