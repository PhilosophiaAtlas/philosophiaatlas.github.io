import {readFile,readdir} from 'node:fs/promises';
import {compileWiki} from '../../.vendor/wiki-core/src/index.mjs';
const dir=new URL('../../.vendor/knowledge-base/articles/',import.meta.url);
let promise;
export function getWiki(){return promise??=(async()=>{const names=(await readdir(dir)).filter(n=>n.endsWith('.md')).sort();const structure=JSON.parse(await readFile(new URL('../structure.json',dir),'utf8'));return compileWiki(await Promise.all(names.map(async path=>({path,text:await readFile(new URL(path,dir),'utf8')}))),structure);})();}
