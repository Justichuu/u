import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createU,digest,canonical,verifyHistory} from '../u.mjs';

test('canonical fingerprint agrees with independent SHA-256 implementation',async()=>{
 const input={b:2,a:['u',null,true]};
 assert.equal(await digest(input),createHash('sha256').update('{"a":["u",null,true],"b":2}').digest('hex'));
 assert.throws(()=>canonical({value:NaN}));assert.throws(()=>canonical(undefined));
});
test('a name is open; an unconnected channel remains unknown',async()=>{
 const u=await createU();const root=u.fingerprint().fingerprint;
 assert.equal(u.rename('Unheard Device'), 'Unheard Device');assert.equal(u.fingerprint().fingerprint,root);
 assert.equal((await u.send('unknown',{meaning:null})).state,'U');
 assert.equal((await u.send('text','hello')).output,'hello');assert.equal(await verifyHistory(u.history()),true);
});
for(const mode of ['hide','rotate','both'])test(mode+' regrows at the elapsed deadline; wall-clock jumps do not decide it',async()=>{
 let time=10,wall=0;const u=await createU({now:()=>time,wall:()=>wall}),first=u.fingerprint();
 const burned=await u.burn({mode,durationMs:50});
 assert.equal(burned.visible,mode==='rotate');assert.equal(burned.alias===first.alias,mode==='hide');
 wall=86400000;time=59;assert.equal(u.fingerprint().remainingMs,1);
 time=60;assert.equal(u.fingerprint().fingerprint,first.fingerprint);assert.equal(u.fingerprint().alias,first.alias);
 assert.equal(u.burns().length,1);
});
test('neither makes no change; Restore and reload restore without erasing provenance',async()=>{
 const u=await createU({now:()=>0,wall:()=>0}),first=u.fingerprint();await u.burn({mode:'both',durationMs:1000});
 const hidden=u.fingerprint();assert.deepEqual(await u.burn({mode:'none'}),u.fingerprint());
 assert.equal(hidden.visible,false);assert.equal(u.provenance().fingerprint,first.fingerprint);
 u.restore();assert.equal(u.fingerprint().fingerprint,first.fingerprint);
 assert.equal((await createU()).fingerprint().fingerprint,first.fingerprint);
 await assert.rejects(u.burn({durationMs:-1}));
});
test('restore wins over an unfinished burn digest',async()=>{
 const u=await createU();const pending=u.burn({mode:'both'});u.restore();await pending;
 assert.equal(u.fingerprint().visible,true);assert.equal(u.fingerprint().returnsAt,null);
});
test('receipt chain detects edits and reorder but is not an identity signature',async()=>{
 const u=await createU();await Promise.all([u.send('text','a'),u.send('text','b')]);const records=u.history();
 assert.equal(await verifyHistory(records),true);assert.equal(await verifyHistory(records.toReversed()),false);
 records[0].output='edited';assert.equal(await verifyHistory(records),false);
 assert.equal(await verifyHistory(u.history()),true);
});
test('Stop settles pending sends as unknown; Resume does not send',async()=>{
 let resolve,stops=0,sends=0;const u=await createU();
 u.register('rod',{send:()=>{sends++;return new Promise(r=>resolve=r);},stop:()=>{stops++;}});
 const pending=u.send('rod',{pulse:1});await u.stop();u.resume();resolve({state:'1',evidence:'Report sent'});
 assert.equal((await pending).state,'U');assert.equal(sends,1);assert.equal(stops,1);
 await u.stop();assert.equal((await u.send('rod',{})).state,'U');assert.equal(sends,1);
});
test('missing, failed and unscoped adapters are U; adapter observations retain their scope',async()=>{
 const u=await createU();u.register('bad',{send:()=>({state:'1'})});u.register('throws',{send:()=>{throw Error('offline');}});
 u.register('negative',{send:()=>({state:'0',evidence:'Instrument returned no matching record',output:null})});
 assert.equal((await u.send('bad',{})).state,'U');assert.equal((await u.send('throws',{})).state,'U');
 assert.equal((await u.send('negative',{})).state,'0');
 assert.ok((await u.stop()).some(r=>r.state==='U'));
});
test('non-JSON adapter output cannot create a gap in the receipt chain',async()=>{
 const u=await createU();u.register('invalid',{send:()=>({state:'1',evidence:'Unusable output',output:NaN})});
 assert.equal((await u.send('invalid',{})).state,'U');await u.send('text','next');
 assert.equal(await verifyHistory(u.history()),true);assert.equal(await verifyHistory([null]),false);
 assert.equal(await verifyHistory({}),false);
});
