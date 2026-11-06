import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coverRect, sequenceIndex, progressiveOrder, envelope } from '../lib/geometry.ts';

test('cover has overscan on every requested viewport',()=>{
  for(const [w,h] of [[1920,1080],[2560,1080],[1440,900],[768,1024],[375,812]]){
    const r=coverRect(w,h); assert.ok(r.x<0&&r.y<0);assert.ok(r.x+r.width>w);assert.ok(r.y+r.height>h);
  }
});
test('scrubbing preserves endpoints, holds and reversibility',()=>{
  assert.equal(sequenceIndex(0,242),0);assert.equal(sequenceIndex(1,242),241);
  assert.equal(sequenceIndex(.06,482,true),0);assert.equal(sequenceIndex(.92,482,true),481);
  for(let i=0;i<=100;i++){const p=i/100;assert.ok(Math.abs(sequenceIndex(p,242)+sequenceIndex(1-p,242)-241)<1e-10);}
});
test('progressive passes reach every frame once and prioritize both endpoints',()=>{
  for(const count of [121,241,242,482]){const order=progressiveOrder(count);assert.equal(order.length,count);assert.equal(new Set(order).size,count);assert.deepEqual(order.slice(0,3),[0,count-1,16]);}
});
test('text envelope is symmetric and flat within the reading zone',()=>{
  assert.equal(envelope(.27),1);assert.equal(envelope(.46),0);assert.equal(envelope(-.46),0);assert.equal(envelope(.35),envelope(-.35));
});
