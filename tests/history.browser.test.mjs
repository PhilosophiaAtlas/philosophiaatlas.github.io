import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium,devices} from 'playwright';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
test('private revision browser and mobile media controls',{timeout:90000},async()=>{
 const base='http://127.0.0.1:4322',server=spawn(process.execPath,['node_modules/astro/astro.js','preview','--host','127.0.0.1','--port','4322'],{stdio:'ignore'});let browser;
 try{
 for(let i=0;i<60;i++){try{if((await fetch(base+'/')).ok)break;}catch{}await delay(250);}
 const data=await (await fetch(base+'/history-data/consciousness.json')).json();assert.ok(data.length>0);assert.match(data[0].sha,/^[a-f0-9]{40}$/);assert.ok(data[0].source.includes('---'));
 browser=await chromium.launch();const page=await browser.newPage({...devices['Pixel 7']});
 await page.goto(base+'/history/consciousness/');await page.locator('#revision-compare').tap();await page.locator('.diff-line').first().waitFor();await page.locator('#revision-view').tap();await page.locator('#revision-output pre').waitFor();assert.equal(await page.locator('#revision-output pre').textContent(),data[0].source);
 // Exercise real comparison with deterministic synthetic revisions without modifying private history.
 const sha='f'.repeat(40),older={sha,date:'2025-01-01T00:00:00.000Z',source:'before\ncommon'},newer={...data[0],source:'after\ncommon'};
 await page.route('**/history-data/consciousness.json',r=>r.fulfill({json:[newer,older]}));
 await page.reload();await page.locator('#history-controls').waitFor();await page.evaluate(({sha})=>{const s=document.querySelector('#revision-old'),o=document.createElement('option');o.value=sha;o.textContent='Test older';s.append(o);s.value=sha;},{sha});
 await page.locator('#revision-compare').tap();await page.locator('.diff-add').waitFor();assert.match(await page.locator('.diff-remove').innerText(),/before/);await page.locator('#revision-context').check();await page.waitForFunction(()=>!document.querySelector('.diff-same'));
 await page.route('**/media/test*.png',r=>r.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X2e0AAAAASUVORK5CYII=','base64')}));
 await page.route('**/wiki/consciousness/',async r=>{const response=await r.fetch();const html=(await response.text()).replace('<article>','<article><img src="/media/test1.png" width="80" height="80" alt="Test one"><img src="/media/test2.png" width="80" height="80" alt="Test two">');await r.fulfill({response,body:html});});
 await page.goto(base+'/wiki/consciousness/');const image=page.locator('article img[alt="Test one"]');await image.tap();await page.locator('#media-viewer').waitFor({state:'visible'});assert.equal(await page.locator('#media-count').innerText(),'1 / 2');await page.locator('#media-next').tap();assert.equal(await page.locator('#media-full').getAttribute('alt'),'Test two');await page.locator('#media-zoom').tap();assert.equal(await page.locator('#media-zoom').getAttribute('aria-pressed'),'true');await page.getByRole('button',{name:'Đóng hình ảnh'}).tap();await page.locator('#media-viewer').waitFor({state:'hidden'});
 }finally{await browser?.close();server.kill();}
});
