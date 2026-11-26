import {getWiki} from '../../lib/wiki.mjs';
export async function getStaticPaths(){const {articles}=await getWiki();return articles.map(a=>({params:{id:a.id},props:{a}}));}
export function GET({props}){const a=props.a;const lead=a.body.trim().split(/\n\s*\n/).find(p=>!p.startsWith('#'))??'';const summary=lead.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g,'$2').replace(/\[\[([^\]]+)\]\]/g,'$1').slice(0,650);return new Response(JSON.stringify({title:a.title,summary}),{headers:{'Content-Type':'application/json; charset=utf-8'}});}
