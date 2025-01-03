import { component$ } from '@builder.io/qwik';

export default component$(() => {
  return (
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">About Robots.txt Analyzer</h1>
      <p class="mb-4">
        Robots.txt Analyzer is a tool designed to help webmasters and SEO professionals understand and analyze robots.txt files. These files are crucial for controlling how search engines and other web robots interact with your website.
      </p>
      <h2 class="text-xl font-semibold mb-2">What is a robots.txt file?</h2>
      <p class="mb-4">
        A robots.txt file is a simple text file placed on a website that provides instructions to web robots (also known as web crawlers or spiders) about which parts of the site should not be processed or scanned.
      </p>
      <h2 class="text-xl font-semibold mb-2">How to use this tool</h2>
      <ol class="list-decimal list-inside mb-4">
        <li>Enter the URL of the website you want to analyze in the input field on the Analyzer page.</li>
        <li>Click the "Analyze" button to fetch and parse the robots.txt file.</li>
        <li>Review the analysis results to understand the rules and directives in the robots.txt file.</li>
      </ol>
      <p>
        For more information about robots.txt files, visit the <a href="https://www.robotstxt.org/" class="text-blue-500 hover:underline">official robots.txt website</a>.
      </p>
    </div>
  );
});
