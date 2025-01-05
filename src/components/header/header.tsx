import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <header class="bg-white border-b border-gray-200">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between items-center">
          <Link href="/" class="text-xl font-semibold text-black">
            Robots.txt Analyzer
          </Link>
          <nav class="flex items-center space-x-8">
            <Link href="/analyzer" class="text-sm font-medium text-gray-700 hover:text-black transition-colors">
              Analyzer
            </Link>
            <Link href="/compare" class="text-sm font-medium text-gray-700 hover:text-black transition-colors">
              Compare
            </Link>
            <Link href="/history" class="text-sm font-medium text-gray-700 hover:text-black transition-colors">
              History
            </Link>
            <Link href="/about" class="text-sm font-medium text-gray-700 hover:text-black transition-colors">
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
});
