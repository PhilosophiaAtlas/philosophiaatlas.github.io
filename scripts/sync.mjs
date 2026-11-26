import { readFile, mkdir, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const lock=JSON.parse(await readFile(new URL('../philosophia.lock.json',import.meta.url),'utf8'));
const git=(args,cwd)=>{
 const env={...process.env,GIT_TERMINAL_PROMPT:'0'};
 // Use a read-only token for private component fetches, never in URLs or files.
 if(args[0]==='fetch'&&process.env.WIKI_CONTENT_TOKEN){
  env.GIT_CONFIG_COUNT='1';env.GIT_CONFIG_KEY_0='http.https://github.com/.extraheader';
  env.GIT_CONFIG_VALUE_0='AUTHORIZATION: basic '+Buffer.from('x-access-token:'+process.env.WIKI_CONTENT_TOKEN).toString('base64');
 }
 delete env.WIKI_CONTENT_TOKEN;
 return execFileSync('git',args,{cwd,env,encoding:'utf8',stdio:['ignore','pipe','inherit']}).trim();
};
await mkdir('.vendor',{recursive:true});
for(const [name,entry] of Object.entries(lock.components)){
 if(!/^[a-z0-9-]+$/.test(name)||entry.repository!=='PhilosophiaAtlas/'+name||!(/^[a-f0-9]{40}$/.test(entry.ref)))throw Error('Invalid component lock: '+name);
 const dir='.vendor/'+name;
 const exists=await stat(dir).then(()=>true,e=>{if(e.code==='ENOENT')return false;throw e});
 const url='https://github.com/'+entry.repository+'.git';
 if(!exists){await mkdir(dir);git(['init'],dir);git(['remote','add','origin',url],dir);}
 if(git(['config','--local','--get','remote.origin.url'],dir)!==url)throw Error('Unexpected origin: '+name);
 if(git(['status','--porcelain'],dir))throw Error('Dirty component: '+name);
 git(['fetch','--depth=1','origin',entry.ref],dir);
 git(['checkout','--detach',entry.ref],dir);
 if(git(['rev-parse','HEAD'],dir)!==entry.ref)throw Error('Wrong ref: '+name);
 console.log(name+' '+entry.ref);
}
