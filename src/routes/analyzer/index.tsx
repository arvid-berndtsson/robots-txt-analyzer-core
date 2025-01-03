import { component$, useSignal, $, useTask$, useOnDocument } from '@builder.io/qwik';
import { useNavigate, useLocation } from '@builder.io/qwik-city';
import { parseRobotsTxt, analyzeRobotsTxt } from '../../utils/robots-parser';

export default component$(() => {
  const url = useSignal('');
  const result = useSignal('');
  const error = useSignal('');
  const isLoading = useSignal(false);
  const navigate = useNavigate();
  const location = useLocation();

  const analyzeRobotsTxtFile = $(async (inputUrl: string) => {
    isLoading.value = true;
    error.value = '';
    result.value = '';

    try {
      const robotsUrl = `${new URL(inputUrl).origin}/robots.txt`;
      const response = await fetch(robotsUrl);
      if (!response.ok) throw new Error('Failed to fetch robots.txt');
      const content = await response.text();
      const parsedRules = parseRobotsTxt(content);
      result.value = analyzeRobotsTxt(parsedRules);

      // Save to history
      await fetch(`/api/history?url=${encodeURIComponent(inputUrl)}`, { method: 'POST' });

      // Update URL without reloading the page
      navigate(`/analyzer?url=${encodeURIComponent(inputUrl)}`, { replace: true });
    } catch (err) {
      console.error('Error:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  });

  useTask$(({ track }) => {
    const urlParam = track(() => location.url.searchParams.get('url'));
    if (urlParam) {
      url.value = urlParam;
      analyzeRobotsTxtFile(urlParam);
    }
  });

  useOnDocument('DOMContentLoaded', $(() => {
    const urlParam = new URLSearchParams(window.location.search).get('url');
    if (urlParam) {
      url.value = urlParam;
      analyzeRobotsTxtFile(urlParam);
    }
  }));

  return (
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Analyze Robots.txt</h1>
      <div class="flex mb-4">
        <input 
          type="text" 
          bind:value={url}
          placeholder="Enter website URL"
          class="flex-grow p-2 border rounded-l"
        />
        <button 
          onClick$={() => analyzeRobotsTxtFile(url.value)}
          class="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600 transition-colors disabled:bg-blue-300"
          disabled={isLoading.value}
        >
          {isLoading.value ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
      {error.value && (
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error.value}
        </div>
      )}
      {isLoading.value && (
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {result.value && (
        <div class="mt-4">
          <h2 class="text-xl font-semibold mb-2">Analysis:</h2>
          <pre class="bg-gray-100 p-4 rounded overflow-x-auto whitespace-pre-wrap">
            {result.value}
          </pre>
        </div>
      )}
    </div>
  );
});
