import {categoryId,categoryHref} from './categories.mjs';
export function buildGraph(wiki){
 const nodes=new Map(),edges=new Map();
 const add=n=>nodes.set(n.id,n);
 const edge=(from,to,kind)=>{if(from!==to&&nodes.has(from)&&nodes.has(to))edges.set(JSON.stringify([from,to,kind]),{from,to,kind});};
 for(const a of wiki.articles)add({id:'article:'+a.id,title:a.title,kind:'article',href:'/wiki/'+a.id+'/'});
 for(const name of Object.keys(wiki.categories))add({id:'category:'+categoryId(name),title:name,kind:'category',href:categoryHref(name)});
 for(const a of wiki.articles)for(const c of a.categories)edge('article:'+a.id,'category:'+categoryId(c),'membership');
 for(const [target,sources] of Object.entries(wiki.backlinks))for(const source of sources)edge('article:'+source,'article:'+target,'link');
 for(const [child,parents] of Object.entries(wiki.categoryParents??{}))for(const parent of parents)edge('category:'+categoryId(child),'category:'+categoryId(parent),'parent');
 return {nodes:[...nodes.values()].sort((a,b)=>a.id.localeCompare(b.id)),edges:[...edges.values()].sort((a,b)=>a.from.localeCompare(b.from)||a.to.localeCompare(b.to)||a.kind.localeCompare(b.kind))};
}
