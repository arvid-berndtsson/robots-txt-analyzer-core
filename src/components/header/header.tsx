import { component$, useSignal } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

export default component$(() => {
  const isMenuOpen = useSignal(false);

  return (
    <header class="border-b border-gray-200 bg-white">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <Link href="/" class="text-lg font-semibold text-black sm:text-xl">
            Robots.txt Analyzer
          </Link>

          {/* Desktop Navigation */}
          <nav class="hidden items-center space-x-8 md:flex">
            <Link
              href="/analyzer"
              class="text-sm font-medium text-gray-700 transition-colors hover:text-black"
            >
              Analyzer
            </Link>
            <Link
              href="/history"
              class="text-sm font-medium text-gray-700 transition-colors hover:text-black"
            >
              History
            </Link>
            <Link
              href="/about"
              class="text-sm font-medium text-gray-700 transition-colors hover:text-black"
            >
              About
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick$={() => (isMenuOpen.value = !isMenuOpen.value)}
            class="p-2 text-gray-700 hover:text-black md:hidden"
            aria-label="Menu"
          >
            <svg
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen.value ? (
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen.value && (
          <nav class="border-t border-gray-200 py-4 md:hidden">
            <div class="flex flex-col space-y-4">
              <Link
                href="/analyzer"
                class="px-2 text-base font-medium text-gray-700 transition-colors hover:text-black"
                onClick$={() => (isMenuOpen.value = false)}
              >
                Analyzer
              </Link>
              <Link
                href="/history"
                class="px-2 text-base font-medium text-gray-700 transition-colors hover:text-black"
                onClick$={() => (isMenuOpen.value = false)}
              >
                History
              </Link>
              <Link
                href="/about"
                class="px-2 text-base font-medium text-gray-700 transition-colors hover:text-black"
                onClick$={() => (isMenuOpen.value = false)}
              >
                About
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
});
