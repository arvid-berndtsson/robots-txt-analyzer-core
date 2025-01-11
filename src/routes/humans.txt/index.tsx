import { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = ({ text }) => {
  const content = `/* TEAM */
Developer: Arvid Berndtsson
Site: https://arvid.tech
Location: Sweden

/* SITE */
Last update: ${new Date().toISOString()}
Standards: HTML5, CSS3, TypeScript
Components: Qwik, Tailwind CSS, Cloudflare Pages
Source: https://github.com/arvid-berndtsson/robots-txt-analyzer`;

  text(200, content);
}; 