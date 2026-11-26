import {getWiki} from '../../lib/wiki.mjs';
import {getHistory} from '../../lib/history.mjs';
export async function getStaticPaths(){const wiki=await getWiki();return wiki.articles.map(article=>({params:{id:article.id},props:{article}}));}
export function GET({props}){return new Response(JSON.stringify(getHistory(props.article).revisions),{headers:{'Content-Type':'application/json; charset=utf-8'}});}
