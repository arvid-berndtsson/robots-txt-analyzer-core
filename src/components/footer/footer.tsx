import { component$ } from '@builder.io/qwik';

export default component$(() => {
  return (
    <footer class="border-t border-gray-200 bg-white">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-sm text-gray-600">
            © {new Date().getFullYear()} <a href="https://arvid.tech/" class="hover:text-gray-900" target="_blank" rel="noopener noreferrer">Arvid Berndtsson</a>
          </div>
          <div class="flex items-center gap-6 text-sm text-gray-600">
            <a href="/privacy" class="hover:text-gray-900">Privacy</a>
            <a href="/terms" class="hover:text-gray-900">Terms</a>
            <a href="https://github.com/arvid-berndtsson/robots-txt-analyzer" class="hover:text-gray-900" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
});
