import {getWiki} from '../lib/wiki.mjs';
export async function GET(){const wiki=await getWiki();return new Response(JSON.stringify(wiki.articles.map(({id,title,revision})=>({id,title,revision}))),{headers:{'Content-Type':'application/json; charset=utf-8'}});}
