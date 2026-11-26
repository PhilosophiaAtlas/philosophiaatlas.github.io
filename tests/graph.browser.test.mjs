import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium,devices} from 'playwright';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
test('mobile knowledge graph, filters, focus, local notes and navigation',{timeout:120000},async()=>{
 const base='http://127.0.0.1:4324',server=spawn(process.execPath,['node_modules/astro/astro.js','preview','--host','127.0.0.1','--port','4324'],{stdio:'ignore'});let browser,phase='startup';
 try{
 for(let i=0;i<60;i++){try{if((await fetch(base+'/')).ok)break;}catch{}await delay(250);}
 phase='data';
 const data=await (await fetch(base+'/graph-data.json')).json();assert.ok(data.nodes.some(n=>n.id==='article:consciousness'));assert.ok(data.edges.length>0);assert.ok(data.nodes.every(n=>n.kind!=='note'));
 browser=await chromium.launch();const context=await browser.newContext({...devices['Pixel 7']});const page=await context.newPage();
 phase='create-note';
 await page.goto(base+'/wiki/consciousness/');await page.locator('[data-new-note]').tap();const dialog=page.locator('[data-note-dialog]');await dialog.locator('[name=title]').fill('Graph private note');await dialog.getByRole('button',{name:'Lưu ghi chú'}).tap();await dialog.waitFor({state:'hidden'});await page.getByRole('heading',{name:'Graph private note'}).waitFor();
 phase='open-graph';
 await page.locator('.wiki-tabs a[href^="/graph/"]').tap();await page.locator('#graph-svg .graph-node.active').waitFor();assert.equal(await page.locator('#graph-svg .graph-node.active').getAttribute('data-node'),'article:consciousness');assert.equal(await page.locator('#graph-open').getAttribute('href'),'/wiki/consciousness/');
 phase='note-neighbor';
 const note=page.locator('#graph-neighbors button',{hasText:'Graph private note'});await note.waitFor();await note.tap();await page.waitForFunction(()=>document.querySelector('#graph-title').textContent==='Graph private note');assert.match(await page.locator('#graph-open').getAttribute('href'),/^\/research\/#note-/);
 phase='back';
 await page.locator('#graph-back').tap();await page.waitForFunction(()=>document.querySelector('#graph-svg .active')?.dataset.node==='article:consciousness');
 phase='node-filter';
 await page.locator('[data-kind="note"]').uncheck();await page.waitForFunction(()=>!document.querySelector('#graph-svg .graph-node.note'));await page.locator('[data-kind="note"]').check();await page.locator('#graph-svg .graph-node.note').waitFor();
 phase='edge-filter';
 await page.locator('[data-edge="source"]').uncheck();await page.waitForFunction(()=>!document.querySelector('#graph-svg .edge-source'));await page.locator('[data-edge="source"]').check();await page.locator('#graph-svg .edge-source').waitFor({state:'attached'});
 phase='zoom-fit';
 const before=await page.locator('#graph-svg').getAttribute('viewBox');await page.locator('#graph-zoom-in').tap();assert.notEqual(await page.locator('#graph-svg').getAttribute('viewBox'),before);await page.locator('#graph-fit').tap();assert.equal(await page.locator('#graph-svg').getAttribute('viewBox'),before);
 phase='search';
 await page.locator('#graph-query').fill('y thuc');await page.locator('#graph-results option[value="article:consciousness"]').waitFor({state:'attached'});await page.locator('#graph-results').selectOption('article:consciousness');await page.locator('#graph-select').tap();
 phase='depth';
 await page.locator('#graph-depth').selectOption('2');await page.locator('#graph-svg .graph-node.active').waitFor();
 phase='overview';
 await page.locator('#graph-overview').tap();await page.waitForFunction(()=>document.querySelector('#graph-title').textContent==='Tổng quan');assert.ok(await page.locator('#graph-list li').count()>0);
 await context.close();
 }catch(error){console.log('SAFE_GRAPH_FAILURE_PHASE='+phase);throw error;}finally{await browser?.close();server.kill();}
});
