import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <>
      <h1>Welcome to Robots.txt Analyzer</h1>
      <p>Analyze and understand robots.txt files with our free tool.</p>
      <a href="/analyzer">Start Analyzing</a>
    </>
  );
});

export const head: DocumentHead = {
  title: "Robots.txt Analyzer",
  meta: [
    {
      name: "description",
      content: "Analyze and understand robots.txt files with our free tool.",
    },
  ],
};

