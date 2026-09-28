import type { APIRoute } from 'astro';
import { GET as getLlms } from './llms.txt';

export const GET: APIRoute = async (context) => {
  return getLlms(context);
};
