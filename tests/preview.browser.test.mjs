import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chromium,devices} from 'playwright';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';

test('mobile preview: repeated taps, dismiss, navigate and return', {timeout:60000}, async()=>{
 const server=spawn(process.execPath,['node_modules/astro/astro.js','preview','--host','127.0.0.1','--port','4321'],{stdio:'ignore'});
 let browser;
 try{
  for(let i=0;i<60;i++){try{if((await fetch('http://127.0.0.1:4321/')).ok)break;}catch{}await delay(250);}
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({...devices['Pixel 7']});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  const link=page.locator('main a[href="/wiki/consciousness/"]').first();
  const dialog=page.locator('#wiki-preview');
  for(let i=0;i<3;i++){
   await link.tap();
   await dialog.waitFor({state:'visible'});
   await page.waitForFunction(()=>document.querySelector('#preview-title').textContent.trim()==='Ý thức'&&document.querySelector('#preview-summary').textContent.includes('nhóm hiện tượng'));
   assert.equal(new URL(page.url()).pathname,'/');
   await page.locator('#preview-dismiss').tap();
   await dialog.waitFor({state:'hidden'});
  }
  await link.tap();
  await dialog.waitFor({state:'visible'});
  // Simulate an accidental rapid activation of the explicit navigation control.
  await page.evaluate(()=>document.querySelector('#preview-open').dispatchEvent(new MouseEvent('click',{bubbles:true,detail:1})));
  assert.equal(new URL(page.url()).pathname,'/');
  await delay(500);
  await Promise.all([page.waitForURL('**/wiki/consciousness/'),page.locator('#preview-open').tap()]);
  await page.goBack();
  await link.tap();
  await dialog.waitFor({state:'visible'});
  assert.equal(new URL(page.url()).pathname,'/');
 }finally{await browser?.close();server.kill();}
});
