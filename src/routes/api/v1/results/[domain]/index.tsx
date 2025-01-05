import { type RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ params, json, env }) => {
  json(501, { error: 'Not implemented' });
  

    // TODO: Implement saving results functionality
  const { domain } = params;

  console.log(domain);
    
  const historyKV = env.get("HISTORY_KV");

  if (!historyKV) {
    throw json(500, { error: 'Analysis storage not available' });
  }




  // const analysis = await env.HISTORY_KV.get(`analysis:${domain}`);
  // if (!analysis) {
  //   throw json(404, { error: 'Analysis not found for the specified domain' });
  // }

  // json(200, JSON.parse(analysis));
};
