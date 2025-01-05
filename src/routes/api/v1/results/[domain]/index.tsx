import { type RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ params, json, env }) => {
  const { domain } = params;

  if (!env.HISTORY_KV) {
    throw json(500, { error: 'Analysis storage not available' });
  }

  const analysis = await env.HISTORY_KV.get(`analysis:${domain}`);
  if (!analysis) {
    throw json(404, { error: 'Analysis not found for the specified domain' });
  }

  json(200, JSON.parse(analysis));
};
