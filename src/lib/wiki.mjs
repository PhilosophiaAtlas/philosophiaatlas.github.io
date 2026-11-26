import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {compileWiki} from '../../.vendor/wiki-core/src/index.mjs';
const dir=new URL('../../.vendor/knowledge-base/articles/',import.meta.url);
let promise;
export function getWiki(){return promise??=(async()=>{const names=(await readdir(dir)).filter(n=>n.endsWith('.md')).sort();const structure=JSON.parse(await readFile(new URL('../structure.json',dir),'utf8'));const records=await Promise.all(names.map(async path=>({path,text:await readFile(new URL(path,dir),'utf8')})));const wiki=compileWiki(records,structure),raw=new Map(records.map(r=>[r.path,r.text]));for(const a of wiki.articles)a.revision=createHash('sha256').update(raw.get(a.path)).digest('hex');return wiki;})();}
export function relatedArticles(wiki,a){
 const links=new Set(wiki.backlinks[a.id]??[]);
 return wiki.articles.filter(b=>b.id!==a.id&&b.kind!=='disambiguation').map(b=>{const categories=b.categories.filter(c=>a.categories.includes(c)),linked=links.has(b.id)||(wiki.backlinks[b.id]??[]).includes(a.id);return {id:b.id,title:b.title,reason:linked?'Có liên kết trực tiếp':'Cùng thể loại',score:4*Number(linked)+categories.length};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title,'vi')).slice(0,6);
}
