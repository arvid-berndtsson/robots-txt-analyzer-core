import { component$, Slot } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.dev/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

export default component$(() => {
  return (
    <div class="flex min-h-screen flex-col bg-white">
      <Header />
      <main class="mx-auto w-full max-w-7xl flex-grow px-4 py-16 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-4xl">
          <Slot />
        </div>
      </main>
      <Footer />
    </div>
  );
});
