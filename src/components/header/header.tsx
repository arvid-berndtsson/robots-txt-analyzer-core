import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <header class="bg-blue-500 text-white p-4">
      <div class="container mx-auto flex justify-between items-center">
        <Link href="/" class="text-2xl font-bold">Robots.txt Analyzer</Link>
        <nav>
          <Link href="/analyzer" class="ml-4">Analyzer</Link>
          <Link href="/compare" class="ml-4">Compare</Link>
          <Link href="/history" class="ml-4">History</Link>
          <Link href="/about" class="ml-4">About</Link>
        </nav>
      </div>
    </header>
  );
});
