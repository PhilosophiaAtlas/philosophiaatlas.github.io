import {readdir,readFile,stat} from 'node:fs/promises';
const dir=new URL('../../../.vendor/knowledge-base/media/',import.meta.url);
const types={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif',avif:'image/avif'};
export async function getStaticPaths(){let files;try{files=await readdir(dir,{withFileTypes:true});}catch(e){if(e.code==='ENOENT')return [];throw e;}return files.filter(f=>f.isFile()&&/^[a-z0-9][a-z0-9_-]{0,100}\.(png|jpe?g|webp|gif|avif)$/.test(f.name)).map(f=>({params:{name:f.name}}));}
export async function GET({params}){const name=params.name;if(!/^[a-z0-9][a-z0-9_-]{0,100}\.(png|jpe?g|webp|gif|avif)$/.test(name))throw Error('Invalid media filename');const url=new URL(name,dir);if((await stat(url)).size>10*1024*1024)throw Error('Media file exceeds 10 MiB');return new Response(await readFile(url),{headers:{'Content-Type':types[name.split('.').pop()]}});}
