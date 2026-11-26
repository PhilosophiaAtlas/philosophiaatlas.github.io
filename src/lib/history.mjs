import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cwd=fileURLToPath(new URL('../../.vendor/knowledge-base/',import.meta.url));
const MAX_REVISIONS=20,MAX_BYTES=100000;
const cache=new Map();
const git=args=>execFileSync('git',args,{cwd,encoding:'utf8',maxBuffer:4*1024*1024,stdio:['ignore','pipe','pipe']});
export function getHistory(article){
 if(cache.has(article.path))return cache.get(article.path);
 if(!/^[a-zA-Z0-9_-]+\.md$/.test(article.path))throw Error('Unsupported article filename for history');
 const path='articles/'+article.path;
 const entries=git(['log','--format=%H%x09%cI','--max-count='+ (MAX_REVISIONS+1),'HEAD','--',path]).trim().split('\n').filter(Boolean);
 const revisions=[];let limited=entries.length>MAX_REVISIONS||git(['rev-parse','--is-shallow-repository']).trim()==='true';
 for(const entry of entries.slice(0,MAX_REVISIONS)){
  const [sha,date]=entry.split('\t');if(!/^[a-f0-9]{40}$/.test(sha)||!Number.isFinite(Date.parse(date)))throw Error('Invalid revision metadata');
  const object=sha+':'+path;
  let size;try{size=Number(git(['cat-file','-s',object]).trim());}catch{limited=true;continue;}
  if(!Number.isSafeInteger(size)||size>MAX_BYTES){limited=true;continue;}
  const source=git(['show',object]);revisions.push({sha,date:new Date(date).toISOString(),source});
 }
 const result={revisions,limited};cache.set(article.path,result);return result;
}
