import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-8">
      <div class="prose prose-gray max-w-none">
        <h1 class="text-3xl font-semibold mb-8">Terms of Service</h1>
        
        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-4">1. Terms</h2>
          <p>
            By accessing the Robots.txt Analyzer at <a href="https://robots-txt.arvid.tech" class="text-black hover:underline">robots-txt.arvid.tech</a>, you agree to be bound by these terms of service and agree that you are responsible for compliance with any applicable local laws.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-4">2. Use License</h2>
          <p class="mb-4">
            This is an open-source project under the MIT license. You are free to:
          </p>
          <ul class="list-disc pl-6 mb-4">
            <li>Use the service for personal and commercial purposes</li>
            <li>Study and modify the source code</li>
            <li>Share and distribute the code</li>
          </ul>
          <p class="mb-4">
            The source code is available on <a href="https://github.com/arvid-berndtsson/robots-txt-analyzer" class="text-black hover:underline" target="_blank" rel="noopener noreferrer">GitHub</a>.
          </p>
          <p><em>While not required by the license, I would appreciate being credited if you use this project or code in your own work. A simple mention or link back would mean a lot!</em></p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-4">3. Disclaimer</h2>
          <p class="mb-4">
            The service is provided "as is". We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties, including without limitation:
          </p>
          <ul class="list-disc pl-6">
            <li>Warranties or merchantability</li>
            <li>Fitness for a particular purpose</li>
            <li>Non-infringement of intellectual property</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-4">4. Limitations</h2>
          <p>
            In no event shall we be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the service.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-4">5. Analysis History</h2>
          <p>
            By using this service, you acknowledge that the URLs you submit and their analysis results will be publicly visible in the analysis history. Do not submit URLs that contain sensitive information.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-4">6. Rate Limiting</h2>
          <p>
            We reserve the right to implement rate limiting or other measures to prevent abuse of the service.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-4">7. Changes</h2>
          <p>
            We reserve the right to modify these terms of service at any time. We do so by posting modified terms on this page.
          </p>
        </section>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Terms of Service - Robots.txt Analyzer",
  meta: [
    {
      name: "description",
      content: "Terms of service for the Robots.txt Analyzer tool. Understand your rights and responsibilities when using our service.",
    },
    {
      name: "robots",
      content: "noindex",
    },
  ],
}; 