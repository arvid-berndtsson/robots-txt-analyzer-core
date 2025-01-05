import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-8">
      <div class="prose prose-gray max-w-none">
        <h1 class="text-3xl font-semibold mb-8">Privacy Policy</h1>
        
        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-4">Information We Collect</h2>
          <p class="mb-4">
            When you use our robots.txt analyzer, we collect and store:
          </p>
          <ul class="list-disc pl-6 mb-4">
            <li>The URLs you submit for analysis</li>
            <li>The timestamp of when the analysis was performed</li>
            <li>The results of the robots.txt analysis</li>
          </ul>
          <p>
            This information is publicly available in the "Recent Analyses" section to help other users learn from common configurations.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-4">How We Use Your Information</h2>
          <p class="mb-4">
            The information collected is used to:
          </p>
          <ul class="list-disc pl-6">
            <li>Display analysis history to all users</li>
            <li>Improve our analysis tool</li>
            <li>Understand common robots.txt configurations</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-4">Data Retention</h2>
          <p>
            Analysis history is retained for a limited time period. We do not collect any personal information beyond the URLs submitted for analysis.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-4">Third-Party Services</h2>
          <p>
            We use Cloudflare for hosting and content delivery. Please refer to <a href="https://www.cloudflare.com/privacy/" class="text-black hover:underline" target="_blank" rel="noopener noreferrer">Cloudflare's Privacy Policy</a> for information about how they handle your data.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-4">Contact</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at <a href="https://arvid.tech" class="text-black hover:underline" target="_blank" rel="noopener noreferrer">arvid.tech</a>.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-4">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
          </p>
        </section>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Privacy Policy - Robots.txt Analyzer",
  meta: [
    {
      name: "description",
      content: "Privacy policy for the Robots.txt Analyzer tool. Learn about how we handle your data.",
    },
    {
      name: "robots",
      content: "noindex",
    },
  ],
}; 