import { component$ } from '@builder.io/qwik';

export default component$(() => {
  return (
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">API Documentation</h1>
      <h2 class="text-xl font-semibold mt-4 mb-2">Endpoints</h2>
      <ul class="list-disc pl-5">
        <li>
          <strong>POST /api/v1/analyze</strong>: Submit a URL for analysis
          <pre class="bg-gray-100 p-2 mt-2 rounded">
            {`
Body: { "url": "https://example.com" }
Response: { "analysis": "..." }
            `}
          </pre>
        </li>
        <li>
          <strong>GET /api/v1/results/:domain</strong>: Fetch analysis results for a specific domain
          <pre class="bg-gray-100 p-2 mt-2 rounded">
            {`
Response: { "url": "...", "timestamp": "...", "analysis": "..." }
            `}
          </pre>
        </li>
        <li>
          <strong>GET /api/v1/history</strong>: Fetch global history of analyzed sites
          <pre class="bg-gray-100 p-2 mt-2 rounded">
            {`
Response: [{ "url": "...", "timestamp": "..." }, ...]
            `}
          </pre>
        </li>
        <li>
          <strong>GET /api/v1/sitemap.xml</strong>: Generate dynamic sitemap
        </li>
      </ul>
    </div>
  );
});
