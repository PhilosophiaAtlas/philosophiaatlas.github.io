import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium,devices} from 'playwright';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
test('mobile research workspace: notes, quotation, links, persistence and backup',{timeout:120000},async()=>{
 const base='http://127.0.0.1:4323',server=spawn(process.execPath,['node_modules/astro/astro.js','preview','--host','127.0.0.1','--port','4323'],{stdio:'ignore'});let browser;
 try{
 for(let i=0;i<60;i++){try{if((await fetch(base+'/')).ok)break;}catch{}await delay(250);}
 browser=await chromium.launch();const context=await browser.newContext({...devices['Pixel 7'],acceptDownloads:true});const page=await context.newPage();
 await page.goto(base+'/wiki/consciousness/');
 await page.locator('[data-new-note]').tap();const dialog=page.locator('[data-note-dialog]');
 await dialog.locator('[name=title]').fill('First research note');await dialog.locator('[name=body]').fill('A private observation');await dialog.locator('[name=tags]').fill('test, philosophy');await dialog.getByRole('button',{name:'Lưu ghi chú'}).tap();await dialog.waitFor({state:'hidden'});await page.getByRole('heading',{name:'First research note'}).waitFor();
 await page.reload();await page.getByRole('heading',{name:'First research note'}).waitFor();
 await page.evaluate(()=>{const article=document.querySelector('main article'),walker=document.createTreeWalker(article,NodeFilter.SHOW_TEXT);let n;while((n=walker.nextNode())){if(n.textContent.trim().length>25&&n.parentElement.closest('p'))break;}const r=document.createRange();r.setStart(n,0);r.setEnd(n,Math.min(n.length,25));const s=getSelection();s.removeAllRanges();s.addRange(r);});
 await page.locator('[data-capture-quote]').waitFor({state:'visible'});await page.locator('[data-capture-quote]').tap();await dialog.waitFor({state:'visible'});await dialog.locator('[name=title]').fill('Saved excerpt');await dialog.locator('[data-link-picker]').selectOption({label:'First research note'});await dialog.locator('[data-add-link]').tap();await dialog.getByRole('button',{name:'Lưu ghi chú'}).tap();await dialog.waitFor({state:'hidden'});
 const quote=page.locator('.research-note').filter({has:page.getByRole('heading',{name:'Saved excerpt'})});await quote.locator('blockquote').waitFor();assert.ok((await quote.locator('blockquote').textContent()).length>0);await quote.getByText('Đúng vị trí đã lưu').waitFor();assert.match(await quote.innerText(),/First research note/);
 await page.goto(base+'/research/');const first=page.locator('.research-note').filter({has:page.getByRole('heading',{name:'First research note'})});await first.waitFor();assert.match(await first.innerText(),/Liên kết ngược: Saved excerpt/);
 await first.getByRole('button',{name:'Sửa',exact:true}).tap();await dialog.locator('[name=body]').fill('Edited observation');await dialog.getByRole('button',{name:'Lưu ghi chú'}).tap();await dialog.waitFor({state:'hidden'});await first.getByText('Edited observation').waitFor();
 await page.locator('[data-note-query]').fill('Saved excerpt');await page.waitForFunction(()=>document.querySelector('[data-note-count]').textContent==='1 ghi chú');await page.locator('[data-note-query]').fill('');
 const downloaded=page.waitForEvent('download');await page.locator('[data-export-notes]').tap();const dl=await downloaded;assert.equal(dl.suggestedFilename(),'philosophia-research.json');
 const backup={version:1,notes:[{id:'33333333-3333-4333-8333-333333333333',title:'Imported note',body:'Backup test',tags:['imported'],links:[],article:null,quote:null,created:'2026-01-01T00:00:00.000Z',updated:'2026-01-01T00:00:00.000Z'}]};
 page.once('dialog',d=>d.accept());await page.locator('[data-import-file]').setInputFiles({name:'notes.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await page.getByRole('heading',{name:'Imported note'}).waitFor();
 await page.locator('[data-note-tag]').selectOption('imported');await page.waitForFunction(()=>document.querySelector('[data-note-count]').textContent==='1 ghi chú');await page.locator('[data-note-tag]').selectOption('');
 page.once('dialog',d=>d.accept());await page.locator('[data-clear-notes]').tap();await page.waitForFunction(()=>document.querySelector('[data-note-count]').textContent==='0 ghi chú');
 await page.reload();await page.waitForFunction(()=>document.querySelector('[data-note-count]').textContent==='0 ghi chú');
 await context.close();
 }finally{await browser?.close();server.kill();}
});
