import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
      <div class="space-y-16 py-8">
        {/* Hero Section */}
        <div class="text-center">
          <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mb-4">
            Understanding Robots.txt
          </h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn about robots.txt files and how they control search engine access to your website.
          </p>
        </div>

        <div class="prose prose-gray max-w-none">
          {/* Introduction */}
          <section class="mb-16">
            <h2 class="text-2xl font-semibold mb-4">What is a robots.txt file?</h2>
            <p class="text-gray-600 mb-4">
              A robots.txt file is a text file that sits in your website's root directory. It provides instructions to search engine crawlers about which parts of your site they can and cannot access.
            </p>
            <div class="rounded-2xl bg-gray-50 p-6 mt-4">
              <p class="text-sm text-gray-600 font-mono">
                Example robots.txt file:<br/>
                User-agent: *<br/>
                Disallow: /private/<br/>
                Allow: /<br/>
                Sitemap: https://example.com/sitemap.xml
              </p>
            </div>
          </section>

          {/* Key Components */}
          <section class="mb-16">
            <h2 class="text-2xl font-semibold mb-4">Key Components</h2>
            <div class="grid sm:grid-cols-2 gap-6">
              <div class="rounded-2xl border border-gray-200 p-6">
                <h3 class="text-lg font-semibold mb-3">User-agent</h3>
                <p class="text-gray-600">
                  Specifies which search engine crawler the rules apply to. An asterisk (*) means the rules apply to all crawlers.
                </p>
              </div>
              <div class="rounded-2xl border border-gray-200 p-6">
                <h3 class="text-lg font-semibold mb-3">Allow/Disallow</h3>
                <p class="text-gray-600">
                  Directives that tell crawlers which URLs or directories they can or cannot access.
                </p>
              </div>
            </div>
          </section>

          {/* Common Issues */}
          <section class="mb-16">
            <h2 class="text-2xl font-semibold mb-4">Common Issues</h2>
            <div class="rounded-2xl border border-gray-200 p-6">
              <ul class="space-y-3 text-gray-600">
                <li>• Blocking important resources (CSS, JavaScript)</li>
                <li>• Incorrect syntax in directives</li>
                <li>• Conflicting allow/disallow rules</li>
                <li>• Missing or incorrect sitemap declarations</li>
              </ul>
            </div>
          </section>

          {/* Best Practices */}
          <section class="mb-16">
            <h2 class="text-2xl font-semibold mb-4">Best Practices</h2>
            <div class="grid sm:grid-cols-2 gap-6">
              <div class="rounded-2xl border border-gray-200 p-6">
                <h3 class="text-lg font-semibold mb-3">Do</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• Use correct syntax</li>
                  <li>• Be specific with rules</li>
                  <li>• Include your sitemap</li>
                  <li>• Test your configuration</li>
                </ul>
              </div>
              <div class="rounded-2xl border border-gray-200 p-6">
                <h3 class="text-lg font-semibold mb-3">Don't</h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• Block essential resources</li>
                  <li>• Use complex patterns unnecessarily</li>
                  <li>• Forget to validate changes</li>
                  <li>• Rely on robots.txt for security</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <div class="rounded-2xl border border-gray-200 p-6 text-center">
            <h2 class="text-2xl font-semibold mb-4">Ready to Check Your robots.txt?</h2>
            <p class="text-gray-600 mb-6">
              Use our analyzer to validate your robots.txt file and get instant feedback.
            </p>
            <a
              href="/analyzer"
              class="inline-flex items-center rounded-full bg-black px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              Analyze Your Site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Learn About Robots.txt Files - Robots.txt Analyzer",
  meta: [
    {
      name: "description",
      content: "Learn about robots.txt files, how they work, best practices, and common issues. Understand how to properly configure your website's robots.txt file.",
    },
    {
      name: "keywords",
      content: "robots.txt, web crawlers, SEO, search engines, website configuration, robots.txt guide",
    },
    {
      property: "og:title",
      content: "Learn About Robots.txt Files - Robots.txt Analyzer",
    },
    {
      property: "og:description",
      content: "Learn about robots.txt files, how they work, best practices, and common issues. Understand how to properly configure your website's robots.txt file.",
    },
    {
      name: "twitter:title",
      content: "Learn About Robots.txt Files - Robots.txt Analyzer",
    },
    {
      name: "twitter:description",
      content: "Learn about robots.txt files, how they work, best practices, and common issues. Understand how to properly configure your website's robots.txt file.",
    },
  ],
};
