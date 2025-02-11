import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div class="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <div class="space-y-16 py-8">
        {/* Hero Section */}
        <div class="text-center">
          <h1 class="mb-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            About Robots.txt Analyzer
          </h1>
          <p class="mx-auto max-w-2xl text-lg text-gray-600">
            A simple, free tool to help you understand and analyze your
            website's robots.txt file.
          </p>
        </div>

        {/* Main Content */}
        <div class="prose prose-gray max-w-none">
          <h2 class="mb-4 text-2xl font-semibold">What We Do</h2>
          <p class="mb-8 text-gray-600">
            We provide a straightforward way to check and validate your
            robots.txt file. Our tool helps you understand how search engines
            interact with your website through your robots.txt configuration.
          </p>

          <div class="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div class="rounded-2xl border border-gray-200 p-6">
              <h3 class="mb-3 text-lg font-semibold">Simple</h3>
              <p class="text-gray-600">
                Just enter your website URL and we'll fetch and analyze your
                robots.txt file.
              </p>
            </div>
            <div class="rounded-2xl border border-gray-200 p-6">
              <h3 class="mb-3 text-lg font-semibold">Free</h3>
              <p class="text-gray-600">
                Our tool is free to use with no registration required.
              </p>
            </div>
            <div class="rounded-2xl border border-gray-200 p-6">
              <h3 class="mb-3 text-lg font-semibold">Helpful</h3>
              <p class="text-gray-600">
                Get clear insights about your robots.txt configuration.
              </p>
            </div>
          </div>

          <h2 class="mb-4 text-2xl font-semibold">How It Works</h2>
          <ol class="mb-12 list-decimal space-y-2 pl-6 text-gray-600">
            <li>Enter your website's URL</li>
            <li>We fetch your robots.txt file</li>
            <li>Our tool analyzes the contents</li>
            <li>View the results and recommendations</li>
          </ol>

          <div class="mb-12 rounded-2xl border border-gray-200 p-6">
            <h2 class="mb-4 text-2xl font-semibold">Want to Learn More?</h2>
            <p class="mb-4 text-gray-600">
              If you're interested in learning more about robots.txt files and
              how they affect your website, check out our documentation:
            </p>
            <div class="flex gap-4">
              <a
                href="/what-is-robots-txt"
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
      content:
        "Learn about our free robots.txt analyzer tool that helps you understand and validate your website's robots.txt configuration.",
    },
    {
      name: "keywords",
      content:
        "robots.txt analyzer, free tool, website analysis, robots.txt validator",
    },
    {
      property: "og:title",
      content: "About Robots.txt Analyzer - A Free Analysis Tool",
    },
    {
      property: "og:description",
      content:
        "Learn about our free robots.txt analyzer tool that helps you understand and validate your website's robots.txt configuration.",
    },
    {
      name: "twitter:title",
      content: "About Robots.txt Analyzer - A Free Analysis Tool",
    },
    {
      name: "twitter:description",
      content:
        "Learn about our free robots.txt analyzer tool that helps you understand and validate your website's robots.txt configuration.",
    },
  ],
};
