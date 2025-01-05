import { type RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ json, env }) => {
  if (!env.HISTORY_KV) {
    throw json(500, { error: 'History storage not available' });
  }

  const list = await env.HISTORY_KV.list({ prefix: 'analysis:' });
  const history = await Promise.all(
    list.keys.map(async (key) => {
      const value = await env.HISTORY_KV.get(key.name);
      return JSON.parse(value);
    })
  );

  json(200, history);
};
