// SPDX-License-Identifier: LicenseRef-U-Device-1.0 OR MIT
// One audio contract for a headset, an audio-connected transducer or another sink.
// Device type and bone-conducted perception are observations the caller must supply.
/* ios-sound start: an iPhone's ringer switch mutes web audio and the system voice, never a video. Before any sound
starts, ask iOS for the playback session (iOS 17 and later); older iOS keeps a silent clip playing alongside. One
copy: ops/release/tonight-20261003/sound/sound.js; a test keeps every page's copy equal to it. */
(function () {
  if (typeof window === "undefined" || window.__iosSound) return; window.__iosSound = 1;   // a module imported by a test in Node has no window
  var older = /iP(hone|ad|od)/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  var silent = null, live = [];
  function playback() {
    [window, window.top].forEach(function (w) {   // the page and, in the reading shell, the page around it
      try { var s = w.navigator.audioSession; if (s && s.type !== "playback") s.type = "playback"; } catch (e) {}
    });
    if (navigator.audioSession || !older) return;
    try {   // a one-off clip lets the session fall back as soon as it ends, so it loops while the page is shown
      if (!silent) { silent = new Audio("/assets/silence.wav"); silent.loop = true; silent.setAttribute("playsinline", ""); }
      if (silent.paused) silent.play().catch(function () {});
    } catch (e) {}
  }
  function wrap(proto, name, ctx) {
    if (!proto || typeof proto[name] !== "function" || proto[name].__ios) return;
    var f = proto[name];
    proto[name] = function () { playback(); var c = ctx(this); if (c && live.indexOf(c) < 0) live.push(c); return f.apply(this, arguments); };
    proto[name].__ios = 1;
  }
  var AC = window.AudioContext || window.webkitAudioContext, mine = function (t) { return t; }, its = function (t) { return t.context; };
  if (AC) wrap(AC.prototype, "resume", mine);
  ["AudioScheduledSourceNode", "AudioBufferSourceNode", "OscillatorNode", "ConstantSourceNode"].forEach(function (n) {   // a buffer source has its own start
    var P = window[n] && window[n].prototype; if (P && Object.prototype.hasOwnProperty.call(P, "start")) wrap(P, "start", its);
  });
  if (window.SpeechSynthesis) wrap(SpeechSynthesis.prototype, "speak", function () { return null; });
  document.addEventListener("visibilitychange", function () {   // iOS suspends audio in a hidden tab; bring it back on return
    if (document.hidden) { if (silent) silent.pause(); return; }
    live.forEach(function (c) { if (c.state === "interrupted") try { c.resume().catch(function () {}); } catch (e) {} });
  });
})();
/* ios-sound end */
export function createAudioAdapter(host=globalThis) {
  let context=null, oscillator=null, utterance=null, finish=null, revision=0;
  const unknown=evidence=>({state:'U',evidence,output:null});
  function stop() {
    revision++;
    if(oscillator){try{oscillator.stop();}catch(_){}oscillator.disconnect();oscillator=null;}
    if(utterance){host.speechSynthesis.cancel();utterance=null;}
    finish?.();finish=null;
  }
  async function send(value) {
    if(!value || !['tone','speech'].includes(value.kind))return unknown('Choose tone or speech for the audio adapter.');
    if(value.kind==='speech'){
      if(typeof value.text!=='string'||!value.text.trim()||value.text.length>10000)return unknown('Speech needs 1 to 10000 text characters.');
      const speech=host.speechSynthesis,voices=speech?.getVoices().filter(v=>v.localService);
      if(!voices?.length || !host.SpeechSynthesisUtterance)return unknown('No local system voice is exposed. Enable a local voice in the browser or operating system, then retry.');
      stop();const current=revision;
      const voice=voices.find(v=>v.lang===value.language)||voices.find(v=>v.default)||voices[0];
      const line=new host.SpeechSynthesisUtterance(value.text);line.voice=voice;
      utterance=line;
      const error=await new Promise(resolve=>{finish=()=>resolve('stopped');line.onend=()=>resolve(null);line.onerror=e=>resolve(e.error||'speech failed');speech.speak(line);});
      if(current!==revision)return unknown('Speech stopped. Physical output is unmeasured.');
      utterance=null;finish=null;
      return error?unknown('Local speech did not finish: '+error):{state:'1',evidence:'A local system voice reported completion through its system output. Bone conduction and understanding are unmeasured.',output:{kind:'speech',characters:value.text.length,language:voice.lang}};
    }
    const {frequencyHz=440,durationMs=70,count=1,gapMs=100,gain=.05}=value;
    if(!Number.isFinite(frequencyHz)||frequencyHz<80||frequencyHz>2000||!Number.isInteger(durationMs)||durationMs<10||durationMs>2000||!Number.isInteger(count)||count<1||count>3||!Number.isInteger(gapMs)||gapMs<0||gapMs>1000||!Number.isFinite(gain)||gain<0||gain>.25)return unknown('Tone values fall outside this adapter: 80-2000 Hz, 10-2000 ms, 1-3 pulses, 0-1000 ms gaps and digital gain 0-0.25. These are software bounds, not measured physical levels.');
    const Audio=host.AudioContext||host.webkitAudioContext;
    if(!Audio)return unknown('This browser has no Web Audio. Use a browser exposing AudioContext.');
    stop();const current=revision;
    context ||= new Audio();await context.resume();
    if(current!==revision)return unknown('Stopped before the audio context resumed.');
    if(context.state!=='running')return unknown('Audio is not running. Use the Test button to start it with a user action.');
    const source=context.createOscillator(),level=context.createGain();oscillator=source;
    source.frequency.value=frequencyHz;source.connect(level);level.connect(context.destination);
    const start=context.currentTime+.02,totalMs=count*durationMs+(count-1)*gapMs;
    level.gain.setValueAtTime(0,start);
    for(let i=0;i<count;i++){
      const at=start+i*(durationMs+gapMs)/1000,end=at+durationMs/1000;
      level.gain.setValueAtTime(0,at);level.gain.linearRampToValueAtTime(gain,at+.005);
      level.gain.setValueAtTime(gain,end-.005);level.gain.linearRampToValueAtTime(0,end);
    }
    await new Promise(resolve=>{finish=resolve;source.onended=resolve;source.start(start);source.stop(start+totalMs/1000);});
    source.disconnect();level.disconnect();
    if(current!==revision)return unknown('Audio stopped. Physical output is unmeasured.');
    oscillator=null;finish=null;
    return {state:'1',evidence:'The audio node reported completion at the system default output. Output-device type and bone-conducted perception are unmeasured.',output:{kind:'tone',frequencyHz,durationMs,count,gapMs,gain,totalMs}};
  }
  return {send,stop,async close(){stop();await context?.close();context=null;}};
}
