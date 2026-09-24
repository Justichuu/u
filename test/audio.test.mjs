import test from 'node:test';
import assert from 'node:assert/strict';
import {createAudioAdapter} from '../audio.mjs';

function fixture({holdResume=false}={}) {
  const nodes=[],envelopes=[];
  let resume;
  const host={AudioContext:class {
    state='running';currentTime=0;destination={};
    resume(){return holdResume?new Promise(resolve=>resume=resolve):Promise.resolve();}
    createOscillator(){const node={frequency:{value:0},connect(){},disconnect(){},start(at){this.started=at;},stop(at){this.stopped=at;}};nodes.push(node);return node;}
    createGain(){const calls=[];envelopes.push(calls);return {connect(){},disconnect(){},gain:{setValueAtTime:(...v)=>calls.push(['set',...v]),linearRampToValueAtTime:(...v)=>calls.push(['ramp',...v])}};}
    close(){this.state='closed';}
  }};
  return {host,nodes,envelopes,resume:()=>resume(),tick:()=>new Promise(r=>setImmediate(r))};
}
test('constructing the audio adapter produces no output; unsupported audio stays U',async()=>{
  const f=fixture();createAudioAdapter(f.host);assert.equal(f.nodes.length,0);
  assert.equal((await createAudioAdapter({}).send({kind:'tone'})).state,'U');
});
test('tone completion reports a software observation and retains physical U',async()=>{
  const f=fixture(),a=createAudioAdapter(f.host),pending=a.send({kind:'tone',count:3,durationMs:2000,gapMs:1000});
  await f.tick();assert.equal(f.nodes.length,1);assert.equal(f.nodes[0].stopped,8.02);
  assert.equal(f.envelopes[0].filter(e=>e[0]==='ramp').length,6);
  f.nodes[0].onended();const result=await pending;
  assert.equal(result.state,'1');assert.equal(result.output.totalMs,8000);assert.match(result.evidence,/unmeasured/);
});
test('Stop before context resume prevents a delayed oscillator',async()=>{
  const f=fixture({holdResume:true}),a=createAudioAdapter(f.host),pending=a.send({kind:'tone'});
  a.stop();f.resume();assert.equal((await pending).state,'U');assert.equal(f.nodes.length,0);
});
test('Stop during a tone resolves it as U',async()=>{
  const f=fixture(),a=createAudioAdapter(f.host),pending=a.send({kind:'tone'});
  await f.tick();a.stop();assert.equal((await pending).state,'U');
  assert.equal(f.nodes[0].stopped,undefined,'Immediate stop has no future timestamp');
});
test('a replacement cancels the prior tone without cancelling the new one',async()=>{
  const f=fixture(),a=createAudioAdapter(f.host),old=a.send({kind:'tone'});
  await f.tick();const latest=a.send({kind:'tone',frequencyHz:880});await f.tick();
  assert.equal((await old).state,'U');f.nodes[1].onended();assert.equal((await latest).state,'1');
});
test('invalid tone parameters never reach the audio graph',async()=>{
  const f=fixture(),a=createAudioAdapter(f.host);
  for(const value of [{frequencyHz:NaN},{count:4},{durationMs:9},{gapMs:-1},{gain:.26}])assert.equal((await a.send({kind:'tone',...value})).state,'U');
  assert.equal(f.nodes.length,0);
});
test('speech uses only local voices, and Stop cancels the pending result',async()=>{
  let line,cancelled=0;
  const host={SpeechSynthesisUtterance:class{constructor(text){this.text=text;}},speechSynthesis:{
    getVoices:()=>[{localService:false,default:true,lang:'en'},{localService:true,lang:'es'}],
    speak:value=>line=value,cancel:()=>cancelled++
  }};
  const a=createAudioAdapter(host),pending=a.send({kind:'speech',text:'Hola',language:'es'});
  assert.equal(line.voice.localService,true);assert.equal(line.voice.lang,'es');line.onend();
  assert.equal((await pending).state,'1');
  const stopped=a.send({kind:'speech',text:'Otra vez'});a.stop();
  assert.equal((await stopped).state,'U');assert.equal(cancelled,1);
  host.speechSynthesis.getVoices=()=>[{localService:false}];
  assert.equal((await a.send({kind:'speech',text:'No remote voice'})).state,'U');
});
