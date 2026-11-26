import {getWiki} from '../lib/wiki.mjs';
export async function GET(){const {articles}=await getWiki();return new Response(JSON.stringify(articles.map(({id,title,originalTitle,aliases})=>({id,title,originalTitle:originalTitle??'',aliases}))),{headers:{'Content-Type':'application/json; charset=utf-8'}});}
