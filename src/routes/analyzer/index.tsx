import { component$, useSignal } from "@builder.io/qwik";

export default component$(() => {
  const url = useSignal("");

  return (
    <div>
      <h1>Analyze Robots.txt</h1>
      <input type="text" bind:value={url} placeholder="Enter website URL" />
      <button
        onClick$={() => {
          // TODO: Implement analysis logic
          console.log("Analyzing:", url.value);
        }}
      >
        Analyze
      </button>
    </div>
  );
});
