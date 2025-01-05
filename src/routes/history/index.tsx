import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

// This would typically come from a server/API
const exampleUrls = [
  // Tech & Social Media
  "github.com", "gitlab.com", "bitbucket.org", "stackoverflow.com",
  "twitter.com", "facebook.com", "instagram.com", "linkedin.com",
  "reddit.com", "youtube.com", "twitch.tv", "discord.com",
  "slack.com", "notion.so", "figma.com", "canva.com",
  
  // E-commerce & Services
  "amazon.com", "ebay.com", "etsy.com", "shopify.com",
  "walmart.com", "target.com", "bestbuy.com", "aliexpress.com",
  "booking.com", "airbnb.com", "expedia.com", "uber.com",
  "doordash.com", "grubhub.com", "instacart.com",
  
  // Tech Companies
  "apple.com", "microsoft.com", "google.com", "intel.com",
  "amd.com", "nvidia.com", "cisco.com", "oracle.com",
  "salesforce.com", "adobe.com", "autodesk.com", "ibm.com",
  "dell.com", "hp.com", "lenovo.com", "samsung.com",
  
  // Swedish Companies
  "spotify.com", "klarna.com", "ericsson.com", "volvo.com",
  "electrolux.com", "ikea.com", "hm.com", "swedbank.se",
  "seb.se", "nordea.se", "telia.se", "vertiseit.se",
  "dise.com", "visualart.com", "grassfish.com", "zetadisplay.com",
  "multiq.com", "aftonbladet.se", "svd.se", "di.se",
  
  // Media & Entertainment
  "netflix.com", "disney.com", "hbomax.com", "spotify.com",
  "soundcloud.com", "bandcamp.com", "medium.com", "substack.com",
  "wordpress.com", "wix.com", "squarespace.com", "webflow.com",
  
  // Education & Learning
  "coursera.org", "udemy.com", "edx.org", "duolingo.com",
  "kahoot.com", "quizlet.com", "academia.edu", "researchgate.net",
  "mit.edu", "harvard.edu", "stanford.edu", "berkeley.edu",
  
  // Productivity & Development
  "atlassian.com", "trello.com", "asana.com", "monday.com",
  "clickup.com", "linear.app", "vercel.com", "netlify.com",
  "heroku.com", "digitalocean.com", "aws.amazon.com", "azure.com",
  
  // News & Information
  "reuters.com", "bloomberg.com", "ft.com", "wsj.com",
  "nytimes.com", "theguardian.com", "bbc.com", "cnn.com",
  "techcrunch.com", "wired.com", "vice.com", "vox.com"
];

// Create entries with timestamps (this would normally be done on the server)
const createEntries = () => {
  const now = new Date();
  const entries = exampleUrls
    .sort(() => Math.random() - 0.5)
    .slice(0, 25)
    .map(url => {
      const minutesAgo = Math.floor(Math.random() * 60);
      const date = new Date(now.getTime() - minutesAgo * 60000);
      return { url, date };
    });

  // Sort by date, most recent first
  return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
};

const selectedEntries = createEntries();

export default component$(() => {
  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mb-4">
          Recent Analyses
        </h1>
        <p class="text-base text-gray-500">
          Example analyses to demonstrate the tool's capabilities.
        </p>
      </div>

      <div class="rounded-2xl border border-gray-200">
        <div class="max-h-[600px] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div class="divide-y divide-gray-200">
            {selectedEntries.map((entry) => (
              <div key={entry.url} class="flex items-center justify-between p-4 hover:bg-gray-50">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center">
                    <span class="text-base text-gray-900">
                      {entry.url}
                    </span>
                  </div>
                  <p class="text-sm text-gray-500 mt-1">
                    {formatDate(entry.date)}
                  </p>
                </div>
                <a
                  href={`/analyzer?url=${entry.url}`}
                  class="ml-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 whitespace-nowrap"
                >
                  Analyze Again
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p class="mt-8 text-sm text-center text-gray-500">
        Note: These are example entries. The history feature will track actual analyses in the future.
      </p>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Analysis History - Robots.txt Analyzer",
  meta: [
    {
      name: "description",
      content: "View recent robots.txt analyses and explore example analyses from various websites.",
    },
    {
      name: "robots",
      content: "noindex",
    },
  ],
};
