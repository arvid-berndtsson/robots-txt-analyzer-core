import { component$ } from '@builder.io/qwik';

export default component$(() => {
  return (
    <footer class="bg-white border-t border-gray-200">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-center">
          <p class="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Robots.txt Analyzer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
});
