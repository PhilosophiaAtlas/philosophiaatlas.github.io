import { readFile, mkdir, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const lock=JSON.parse(await readFile(new URL('../philosophia.lock.json',import.meta.url),'utf8'));
const git=(args,cwd)=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','inherit']}).trim();
await mkdir('.vendor',{recursive:true});
for(const [name,entry] of Object.entries(lock.components)){
 if(!/^[a-z0-9-]+$/.test(name)||entry.repository!=='PhilosophiaAtlas/'+name||!(/^[a-f0-9]{40}$/.test(entry.ref)))throw Error('Invalid component lock: '+name);
 const dir='.vendor/'+name;
 const exists=await stat(dir).then(()=>true,e=>{if(e.code==='ENOENT')return false;throw e});
 const url='https://github.com/'+entry.repository+'.git';
 if(!exists){await mkdir(dir);git(['init'],dir);git(['remote','add','origin',url],dir);}
 if(git(['remote','get-url','origin'],dir)!==url)throw Error('Unexpected origin: '+name);
 if(git(['status','--porcelain'],dir))throw Error('Dirty component: '+name);
 git(['fetch','--depth=1','origin',entry.ref],dir);
 git(['checkout','--detach',entry.ref],dir);
 if(git(['rev-parse','HEAD'],dir)!==entry.ref)throw Error('Wrong ref: '+name);
 console.log(name+' '+entry.ref);
}
