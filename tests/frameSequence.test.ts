import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FrameSequence } from '../lib/frameSequence.ts';
const settle=()=>new Promise(resolve=>setTimeout(resolve,25));
test('decoded cache stays bounded during forward/reverse flings and closes resources',async()=>{
  const originalFetch=globalThis.fetch, originalBitmap=globalThis.createImageBitmap;
  let live=0, peak=0, fail=false;
  globalThis.fetch=(async()=>{if(fail)throw Error('offline');return new Response(new Blob(['pixels']));}) as typeof fetch;
  globalThis.createImageBitmap=(async()=>{live++;peak=Math.max(peak,live);let closed=false;return {width:1920,height:1080,close(){assert.equal(closed,false);closed=true;live--;}};}) as typeof createImageBitmap;
  const sequence=new FrameSequence('/frames/parte4',482,16);
  try{
    for(const frame of [0,10,100,300,481,200,1]){sequence.seek(frame,frame<200?-1:1);await settle();assert.ok(sequence.decodedCount<=16);assert.ok(sequence.nearest(frame));}
    assert.ok(peak<=18,'limit plus two in-flight decodes');assert.ok(sequence.closed>0);
    fail=true;sequence.seek(420);await settle();assert.ok(sequence.nearest(420),'network failure preserves nearest decoded image');
    sequence.release();await settle();assert.equal(sequence.decodedCount,0);assert.equal(live,0);
    fail=false;sequence.seek(240);sequence.destroy();await settle();assert.equal(live,0,'in-flight results close after teardown');
  }finally{sequence.destroy();globalThis.fetch=originalFetch;globalThis.createImageBitmap=originalBitmap;}
});
