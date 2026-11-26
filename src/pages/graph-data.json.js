import {getWiki} from '../lib/wiki.mjs';
import {buildGraph} from '../lib/graph.mjs';
export async function GET(){return new Response(JSON.stringify(buildGraph(await getWiki())),{headers:{'Content-Type':'application/json; charset=utf-8'}});}
