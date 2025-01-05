import { type RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ json, env, request }) => {
  const apiKey = env.get("API_KEY");
  const historyKV = env.get("HISTORY_KV");

  if (request.headers.get("X-API-Key") !== apiKey) {
    throw json(401, { error: "Unauthorized" });
  }
  if (!historyKV) {
    throw json(500, { error: 'History storage not available' });
  }

  json(501, { error: 'Not implemented' });

  // TODO: Implement saving results functionality
  // const list = await historyKV.list({ prefix: 'analysis:' });
  // const history = await Promise.all(
  //   list.keys.map(async (key) => {
  //     const value = await historyKV.get(key.name);
  //     return JSON.parse(value);
  //   })
  // );

  json(200, history);
};
