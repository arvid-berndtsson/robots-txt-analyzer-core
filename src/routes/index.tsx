import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div class="text-center">
      <h1 class="text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl mb-6">
        Robots.txt Analyzer
      </h1>
      <p class="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
        Understand how search engines interact with your website. Analyze your robots.txt file with our powerful, intuitive tool.
      </p>
      <div class="flex justify-center gap-4">
        <a
          href="/analyzer"
          class="rounded-full bg-black px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Start Analyzing
        </a>
        <a
          href="/about"
          class="rounded-full bg-white px-8 py-4 text-base font-semibold text-black shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Learn More
        </a>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Robots.txt Analyzer - Understand Your Website's Crawling Rules",
  meta: [
    {
      name: "description",
      content: "Analyze and understand your robots.txt file with our free tool. Get insights into how search engines interact with your website.",
    },
  ],
};

