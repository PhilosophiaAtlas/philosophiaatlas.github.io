import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium,devices} from 'playwright';
import worker from '../worker/auth.mjs';
test('native mobile login and logout form submits', {timeout:60000},async()=>{
 const browser=await chromium.launch({headless:true});
 try{
 const origin='https://auth-test.example';
 const env={AUTH_USER:'test-only',AUTH_PASSWORD:'test-only-password-123456789',AUTH_SESSION_KEY:'test-only-secret-012345678901234567890',LOGIN_LIMIT:{limit:async()=>({success:true})},ASSETS:{fetch:async()=>new Response('PRIVATE CONTENT',{headers:{'Content-Type':'text/html'}})}};
 const context=await browser.newContext({...devices['Pixel 7']});
 const page=await context.newPage();
 let loginOrigin;
 await context.route(origin+'/**',async route=>{
 const req=route.request(),h=await req.allHeaders();
 if(req.method()==='POST'&&req.url().endsWith('/auth/login'))loginOrigin=h.origin;
 const res=await worker.fetch(new Request(req.url(),{method:req.method(),headers:h,...(req.postDataBuffer()?{body:req.postDataBuffer()}: {})}),env);
 await route.fulfill({status:res.status,headers:Object.fromEntries(res.headers),body:await res.text()});
 });
 await page.goto(origin+'/auth/login');
 await page.locator('#user').fill(env.AUTH_USER);
 await page.locator('#password').fill('incorrect');
 await page.locator('form button').click();
 await page.getByRole('alert').waitFor();
 assert.match(await page.getByRole('alert').innerText(),/không đúng/);
 assert.equal(loginOrigin,origin);
 await page.locator('#user').fill(env.AUTH_USER);
 await page.locator('#password').fill(env.AUTH_PASSWORD);
 await page.locator('form button').click();
 await page.waitForURL(origin+'/');
 assert.match(await page.locator('body').innerText(),/PRIVATE CONTENT/);
 await page.goto(origin+'/auth/logout');
 await page.locator('form button').click();
 await page.waitForURL(origin+'/auth/login');
 await page.locator('#user').waitFor();
 }finally{await browser.close();}
});
