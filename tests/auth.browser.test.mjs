import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium,devices} from 'playwright';
import {createServer} from 'node:https';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import worker from '../worker/auth.mjs';

test('native mobile login and logout form submits over HTTPS', {timeout:60000},async()=>{
 const dir=await mkdtemp(join(tmpdir(),'philosophia-auth-'));
 let server,browser;
 try{
 const keyPath=join(dir,'key.pem'),certPath=join(dir,'cert.pem');
 execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',keyPath,'-out',certPath,'-days','1','-subj','/CN=localhost'],{stdio:'ignore'});
 const env={AUTH_USER:'test-only',AUTH_PASSWORD:'test-only-password-123456789',AUTH_SESSION_KEY:'test-only-secret-012345678901234567890',LOGIN_LIMIT:{limit:async()=>({success:true})},ASSETS:{fetch:async()=>new Response('PRIVATE CONTENT',{headers:{'Content-Type':'text/html'}})}};
 let origin,loginOrigin;
 server=createServer({key:await readFile(keyPath),cert:await readFile(certPath)},async(req,res)=>{
  try{
   const chunks=[];for await(const chunk of req)chunks.push(chunk);
   const body=Buffer.concat(chunks);
   if(req.method==='POST'&&req.url==='/auth/login')loginOrigin=req.headers.origin;
   const response=await worker.fetch(new Request(origin+req.url,{method:req.method,headers:req.headers,...(body.length?{body}:{})}),env);
   res.writeHead(response.status,Object.fromEntries(response.headers));
   res.end(Buffer.from(await response.arrayBuffer()));
  }catch(error){res.writeHead(500);res.end(String(error));}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 origin='https://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({...devices['Pixel 7'],ignoreHTTPSErrors:true});
 const page=await context.newPage();
 await page.goto(origin+'/wiki/consciousness/');
 await page.waitForURL(origin+'/auth/login');
 await page.locator('#user').fill(env.AUTH_USER);
 await page.locator('#password').fill('incorrect');
 await page.locator('form button').click();
 await page.getByRole('alert').waitFor();
 assert.match(await page.getByRole('alert').innerText(),/không đúng/);
 assert.equal(loginOrigin,origin);
 await page.locator('#user').fill(env.AUTH_USER);
 await page.locator('#password').fill(env.AUTH_PASSWORD);
 await Promise.all([page.waitForURL(origin+'/'),page.locator('form button').click()]);
 assert.match(await page.locator('body').innerText(),/PRIVATE CONTENT/);
 const cookie=(await context.cookies()).find(c=>c.name==='__Host-philosophia');
 assert.ok(cookie?.secure&&cookie?.httpOnly&&cookie?.sameSite==='Strict');
 await page.goto(origin+'/auth/logout');
 await Promise.all([page.waitForURL(origin+'/auth/login'),page.locator('form button').click()]);
 await page.locator('#user').waitFor();
 assert.equal((await context.cookies()).some(c=>c.name==='__Host-philosophia'),false);
 await page.goto(origin+'/wiki/consciousness/');
 await page.waitForURL(origin+'/auth/login');
 }finally{await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));await rm(dir,{recursive:true,force:true});}
});
