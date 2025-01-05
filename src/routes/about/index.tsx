import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
      <div class="space-y-16 py-8">
        {/* Hero Section */}
        <div class="text-center">
          <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mb-4">
            About Robots.txt Analyzer
          </h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            A simple, free tool to help you understand and analyze your website's robots.txt file.
          </p>
        </div>

        {/* Main Content */}
        <div class="prose prose-gray max-w-none">
          <h2 class="text-2xl font-semibold mb-4">What We Do</h2>
          <p class="text-gray-600 mb-8">
            We provide a straightforward way to check and validate your robots.txt file. Our tool helps you understand how search engines interact with your website through your robots.txt configuration.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div class="rounded-2xl border border-gray-200 p-6">
              <h3 class="text-lg font-semibold mb-3">Simple</h3>
              <p class="text-gray-600">
                Just enter your website URL and we'll fetch and analyze your robots.txt file.
              </p>
            </div>
            <div class="rounded-2xl border border-gray-200 p-6">
              <h3 class="text-lg font-semibold mb-3">Free</h3>
              <p class="text-gray-600">
                Our tool is free to use with no registration required.
              </p>
            </div>
            <div class="rounded-2xl border border-gray-200 p-6">
              <h3 class="text-lg font-semibold mb-3">Helpful</h3>
              <p class="text-gray-600">
                Get clear insights about your robots.txt configuration.
              </p>
            </div>
          </div>

          <h2 class="text-2xl font-semibold mb-4">How It Works</h2>
          <ol class="list-decimal pl-6 mb-12 text-gray-600 space-y-2">
            <li>Enter your website's URL</li>
            <li>We fetch your robots.txt file</li>
            <li>Our tool analyzes the contents</li>
            <li>View the results and recommendations</li>
          </ol>

          <div class="rounded-2xl border border-gray-200 p-6 mb-12">
            <h2 class="text-2xl font-semibold mb-4">Want to Learn More?</h2>
            <p class="text-gray-600 mb-4">
              If you're interested in learning more about robots.txt files and how they affect your website, check out our documentation:
            </p>
            <div class="flex gap-4">
              <a
                href="/learn"
                class="inline-flex items-center rounded-full bg-white px-8 py-3 text-base font-semibold text-black shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Read Documentation
              </a>
              <a
                href="/analyzer"
                class="inline-flex items-center rounded-full bg-black px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                Try the Analyzer
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "About Robots.txt Analyzer - A Free Analysis Tool",
  meta: [
    {
      name: "description",
      content: "Learn about our free robots.txt analyzer tool that helps you understand and validate your website's robots.txt configuration.",
    },
    {
      name: "keywords",
      content: "robots.txt analyzer, free tool, website analysis, robots.txt validator",
    },
    {
      property: "og:title",
      content: "About Robots.txt Analyzer - A Free Analysis Tool",
    },
    {
      property: "og:description",
      content: "Learn about our free robots.txt analyzer tool that helps you understand and validate your website's robots.txt configuration.",
    },
    {
      name: "twitter:title",
      content: "About Robots.txt Analyzer - A Free Analysis Tool",
    },
    {
      name: "twitter:description",
      content: "Learn about our free robots.txt analyzer tool that helps you understand and validate your website's robots.txt configuration.",
    },
  ],
};
