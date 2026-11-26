import test from 'node:test';
import assert from 'node:assert/strict';
import {diffLines} from '../.vendor/wiki-ui/src/revision-diff.mjs';
test('exact diff reconstructs both inputs and counts changes',()=>{for(const [a,b] of [['a\nb\nc','a\nX\nc'],['','a'],['a\nb','b\na'],['x\n','x\n'],['a\na\nb','a\nb\na']]){const d=diffLines(a,b);assert.equal(d.rows.filter(x=>x.kind!=='add').map(x=>x.text).join('\n'),a);assert.equal(d.rows.filter(x=>x.kind!=='remove').map(x=>x.text).join('\n'),b);assert.equal(d.added,d.rows.filter(x=>x.kind==='add').length);}assert.deepEqual(diffLines('a\nb','a\nc').rows.map(x=>x.kind),['same','remove','add']);});
test('large comparisons fall back safely',()=>{const a=Array.from({length:1100},(_,i)=>'a'+i).join('\n'),b=Array.from({length:1100},(_,i)=>'b'+i).join('\n');const d=diffLines(a,b);assert.equal(d.coarse,true);assert.equal(d.added,1100);assert.equal(d.removed,1100);});
