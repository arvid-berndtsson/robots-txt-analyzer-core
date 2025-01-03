import { component$, useSignal, $ } from '@builder.io/qwik';
import { parseRobotsTxt, analyzeRobotsTxt } from '../../utils/robots-parser';

export default component$(() => {
  const url1 = useSignal('');
  const url2 = useSignal('');
  const result = useSignal('');
  const error = useSignal('');
  const isLoading = useSignal(false);

  const compareRobotsTxt = $(async () => {
    isLoading.value = true;
    error.value = '';
    result.value = '';

    try {
      const [content1, content2] = await Promise.all([
        fetch(`${new URL(url1.value).origin}/robots.txt`).then(res => res.text()),
        fetch(`${new URL(url2.value).origin}/robots.txt`).then(res => res.text())
      ]);

      const rules1 = parseRobotsTxt(content1);
      const rules2 = parseRobotsTxt(content2);

      const analysis1 = analyzeRobotsTxt(rules1);
      const analysis2 = analyzeRobotsTxt(rules2);

      result.value = `Analysis for ${url1.value}:\n\n${analysis1}\n\nAnalysis for ${url2.value}:\n\n${analysis2}`;
    } catch (err) {
      console.error('Error:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  });

  return (
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Compare Robots.txt Files</h1>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <input 
          type="text" 
          bind:value={url1}
          placeholder="Enter first website URL"
          class="p-2 border rounded"
        />
        <input 
          type="text" 
          bind:value={url2}
          placeholder="Enter second website URL"
          class="p-2 border rounded"
        />
      </div>
      <button 
        onClick$={compareRobotsTxt}
        class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300 w-full"
        disabled={isLoading.value}
      >
        {isLoading.value ? 'Comparing...' : 'Compare'}
      </button>
      {error.value && (
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
          {error.value}
        </div>
      )}
      {result.value && (
        <div class="mt-4">
          <h2 class="text-xl font-semibold mb-2">Comparison Results:</h2>
          <pre class="bg-gray-100 p-4 rounded overflow-x-auto whitespace-pre-wrap">
            {result.value}
          </pre>
        </div>
      )}
    </div>
  );
});
