import { readFile, mkdir, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { devNull } from 'node:os';
const lock=JSON.parse(await readFile(new URL('../philosophia.lock.json',import.meta.url),'utf8'));
const token=process.env.WIKI_CONTENT_TOKEN;
const git=(args,cwd,authenticated=false)=>{
 const env={...process.env,GIT_TERMINAL_PROMPT:'0'};
 delete env.WIKI_CONTENT_TOKEN;
 if(authenticated){
  // Bypass host-specific URL rewrites and inherited auth for the private repo only.
  env.GIT_CONFIG_GLOBAL=devNull;
  env.GIT_CONFIG_NOSYSTEM='1';
  delete env.GIT_CONFIG_PARAMETERS;
  env.GIT_CONFIG_COUNT='2';
  env.GIT_CONFIG_KEY_0='http.https://github.com/.extraheader';
  env.GIT_CONFIG_VALUE_0='';
  env.GIT_CONFIG_KEY_1='http.https://github.com/.extraheader';
  env.GIT_CONFIG_VALUE_1='AUTHORIZATION: basic '+Buffer.from('x-access-token:'+token).toString('base64');
 }
 try{return execFileSync('git',args,{cwd,env,encoding:'utf8',stdio:['ignore','pipe',authenticated?'pipe':'inherit']}).trim();}
 catch(error){if(authenticated)throw Error('Authenticated knowledge-base fetch failed; verify build secret and repository permissions.');throw error;}
};
if(token){
 const entry=lock.components['knowledge-base'];
 if(entry?.repository!=='PhilosophiaAtlas/knowledge-base'||!(/^[a-f0-9]{40}$/.test(entry.ref)))throw Error('Invalid knowledge-base lock');
 const options={headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','User-Agent':'Philosophia-build'},redirect:'error'};
 const metadata=await fetch('https://api.github.com/repos/PhilosophiaAtlas/knowledge-base',options);
 if(!metadata.ok)throw Error('Knowledge-base metadata check failed (HTTP '+metadata.status+')');
 if((await metadata.json()).private!==true)throw Error('Knowledge-base must remain private');
 console.log('Knowledge-base visibility: private');
 const response=await fetch('https://api.github.com/repos/PhilosophiaAtlas/knowledge-base/git/commits/'+entry.ref,options);
 if(!response.ok)throw Error('Knowledge-base token verification failed (HTTP '+response.status+')');
 const commit=await response.json();
 if(commit.sha!==entry.ref)throw Error('Knowledge-base token returned unexpected commit');
 console.log('Knowledge-base token: authenticated API check passed');
}else throw Error('WIKI_CONTENT_TOKEN is required for the private knowledge-base');
await mkdir('.vendor',{recursive:true});
for(const [name,entry] of Object.entries(lock.components)){
 if(!/^[a-z0-9-]+$/.test(name)||entry.repository!=='PhilosophiaAtlas/'+name||!(/^[a-f0-9]{40}$/.test(entry.ref)))throw Error('Invalid component lock: '+name);
 const dir='.vendor/'+name;
 const exists=await stat(dir).then(()=>true,e=>{if(e.code==='ENOENT')return false;throw e});
 const url='https://github.com/'+entry.repository+'.git';
 if(!exists){await mkdir(dir);git(['init'],dir);git(['remote','add','origin',url],dir);}
 if(git(['config','--local','--get','remote.origin.url'],dir)!==url)throw Error('Unexpected origin: '+name);
 if(git(['status','--porcelain'],dir))throw Error('Dirty component: '+name);
 git(['fetch',name==='knowledge-base'?'--depth=200':'--depth=1','origin',entry.ref],dir,name==='knowledge-base'&&!!token);
 git(['checkout','--quiet','--detach',entry.ref],dir);
 if(git(['rev-parse','HEAD'],dir)!==entry.ref)throw Error('Wrong ref: '+name);
 console.log(name+' '+entry.ref);
}
