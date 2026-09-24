// U Device. SPDX-License-Identifier: LicenseRef-U-Device-1.0
// A name is a label. An observation is bounded by its instrument.
export const STANDARD = 'u-device/1';
export const contributors = Object.freeze([
  {name:'Justichuu', role:'Direction and license proposal', basis:'Owner statement'},
  {name:'OpenAI Codex', role:'This implementation and its recorded software checks', basis:'This release'},
  {name:'Claude', role:'Named in the surrounding workflow; U: contribution to this module unverified', basis:'Owner context'},
  {name:'Copilot', role:'Named in the surrounding workflow; U: contribution to this module unverified', basis:'Owner context'},
  {name:'Ollama / huihui_ai/qwen3.5-abliterated', role:'Quoted conversation influenced the brief; no module authorship inferred', basis:'Owner supplied excerpt'},
  {name:'Unknown contributors and influences', role:'U: add a name and evidence when known', basis:'Open record'}
]);

function copy(value) { return JSON.parse(canonical(value)); }
export function canonical(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    return '{' + Object.keys(value).sort().map(key => JSON.stringify(key)+':'+canonical(value[key])).join(',') + '}';
  }
  throw new TypeError('Use finite JSON data: null, boolean, number, string, array or plain object.');
}
export async function digest(value) {
  if (!globalThis.crypto?.subtle) throw new Error('U: SHA-256 unavailable. Use a runtime with Web Crypto.');
  const bytes = new TextEncoder().encode(canonical(value));
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
}
function nameOf(value) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError('Give the device or channel a nonempty name.');
  return value.trim();
}

export async function createU(options={}) {
  const now = options.now || (()=>performance.now());
  const wall = options.wall || (()=>Date.now());
  const credit = copy(options.contributors || contributors);
  const lineage = {standard:STANDARD, contributors:credit};
  const root = await digest(lineage);
  const stableAlias = 'u-'+root.slice(0,16);
  let name = nameOf(options.name || 'U Device'), alias = stableAlias;
  let hidden = false, deadline = null, returnAt = null, burnRevision = 0;
  let sequence = 0, epoch = 0, paused = false, previous = null;
  const adapters = new Map(), records = [], burns = [];
  const nowValue=()=>{const value=now();if(!Number.isFinite(value))throw new Error('U: the elapsed clock is unavailable.');return value;};
  const stamp=()=>new Date(wall()).toISOString();
  function restore() {
    alias=stableAlias; hidden=false; deadline=null; returnAt=null; burnRevision++;
    return fingerprint();
  }
  function fingerprint() {
    if (deadline!==null && nowValue()>=deadline) {
      alias=stableAlias;hidden=false;deadline=null;returnAt=null;
    }
    return {standard:STANDARD,name,alias,visible:!hidden,fingerprint:hidden?null:root,
      returnsAt:returnAt,remainingMs:deadline===null?0:Math.max(0,deadline-nowValue()),
      clock:'Elapsed host clock; returnsAt is an estimate from the host wall clock',
      scope:'Display only. Public source and provenance remain available.'};
  }
  async function burn({mode='both',durationMs=60000}={}) {
    if (!['none','hide','rotate','both'].includes(mode)) throw new TypeError('Use none, hide, rotate or both.');
    if (!Number.isSafeInteger(durationMs)||durationMs<1) throw new TypeError('Duration must be a positive whole number of milliseconds.');
    if (mode==='none') return fingerprint();
    const revision=++burnRevision, started=nowValue();
    const salt=Array.from(crypto.getRandomValues(new Uint8Array(16)));
    const rotated='u-'+(await digest({root,revision,salt})).slice(0,16);
    // A later burn or Restore wins even if this digest completes afterwards.
    if(revision!==burnRevision)return fingerprint();
    hidden=mode==='hide'||mode==='both';
    alias=mode==='rotate'||mode==='both'?rotated:stableAlias;
    deadline=started+durationMs;returnAt=new Date(wall()+Math.max(0,deadline-nowValue())).toISOString();
    burns.push({mode,alias,at:stamp(),durationMs,scope:'Temporary display state; public provenance retained'});
    return fingerprint();
  }
  let receiptQueue=Promise.resolve();
  function receipt(channel,payload,state,evidence,output=null) {
    const operation=async()=>{
      const record={standard:STANDARD,sequence:++sequence,name,channel,state,evidence,payload:copy(payload),output:copy(output),
        at:stamp(),clock:'Host wall clock, not independently certified',provenance:root,previous};
      record.hash=await digest(record);previous=record.hash;records.push(record);return copy(record);
    };
    const result=receiptQueue.then(operation);receiptQueue=result.catch(()=>{});return result;
  }
  adapters.set('text',{send:async value=>({state:'1',evidence:'Local text adapter returned the supplied value; meaning remains open.',output:value}),stop:()=>{}});
  function register(channel,adapter) {
    channel=nameOf(channel);
    if(!adapter||typeof adapter.send!=='function')throw new TypeError('An adapter needs a send function.');
    if(adapters.has(channel))throw new Error('A channel with this name already exists. Use a distinct name.');
    adapters.set(channel,adapter);
    return ()=>adapters.delete(channel);
  }
  async function send(channel,payload) {
    channel=nameOf(channel);payload=copy(payload);
    if(paused)return receipt(channel,payload,'U','Paused. Resume explicitly before sending.');
    const adapter=adapters.get(channel);
    if(!adapter)return receipt(channel,payload,'U','No adapter registered for this channel. Connect one to check it.');
    const started=epoch;
    try {
      const response=await adapter.send(copy(payload));
      if(started!==epoch)return receipt(channel,payload,'U','Stopped during the request. A physical effect already sent may continue.');
      if(!response||!['1','0','U'].includes(response.state)||typeof response.evidence!=='string'||!response.evidence.trim()) {
        return receipt(channel,payload,'U','Adapter returned no scoped observation. Inspect its contract.');
      }
      const output=copy(response.output??null);
      return receipt(channel,payload,response.state,response.evidence,output);
    }catch(error){return receipt(channel,payload,'U','Adapter failed: '+String(error?.message||error));}
  }
  async function stop() {
    paused=true;epoch++;
    const results=await Promise.all(Array.from(adapters,async([channel,adapter])=>{
      if(typeof adapter.stop!=='function')return {channel,state:'U',evidence:'No stop operation is exposed by this adapter.'};
      try {await adapter.stop();return {channel,state:'1',evidence:'Adapter stop returned. Physical stopping is unmeasured.'};}
      catch(error){return {channel,state:'U',evidence:'Stop failed: '+String(error?.message||error)};}
    }));
    return results;
  }
  return Object.freeze({
    standard:STANDARD,
    names:['U Device','Universal Device','Unknown Device'],
    rename(value){name=nameOf(value);return name;},
    fingerprint,burn,restore,register,send,stop,
    resume(){paused=false;return {paused};},
    state(){return {paused,channels:Array.from(adapters.keys())};},
    provenance(){return copy({...lineage,fingerprint:root});},
    history(){return copy(records);},burns(){return copy(burns);}
  });
}

export async function verifyHistory(records) {
  if(!Array.isArray(records))return false;
  let previous=null,sequence=0;
  try {for(const record of records) {
      const {hash,...value}=record;
      if(value.previous!==previous||value.sequence!==++sequence||await digest(value)!==hash)return false;
      previous=hash;
  }}catch(_){return false;}
  return true;
}
