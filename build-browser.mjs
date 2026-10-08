// A self-contained browser file, built from the same modules as the runtime checks.
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const args=process.argv.slice(2);let check=false,site;
for(let i=0;i<args.length;i++){
 if(args[i]==='--check')check=true;
 else if(args[i]==='--site'&&args[i+1]&&!args[i+1].startsWith('--'))site=args[++i];
 else throw Error('Usage: node build-browser.mjs [--check] [--site PATH-TO-SITE-ROOT]');
}
const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');
const source=read('u.js');
const logic=source.slice(0,source.indexOf('\nif (process.argv[1]')).replace(/^import .*$/m,'').replace(/^export /gm,'');
if(!logic.includes('const KNOWN')||logic.includes('node:url'))throw Error('Review the logic entry point before bundling.');
const protocol=read('u.mjs').replace(/^export /gm,'');
const fishSource=read('fish.js');
const fish=fishSource.replace(/^import .*$/gm,'').replace(/^export /gm,'');
if(/\bimport\s/.test(fish))throw Error('Review the fish imports before bundling.');
const fractalSource=read('fish-fractal.js');
const fractal=fractalSource.replace(/^import .*$/gm,'').replace(/^export /gm,'');
if(/\bimport\s/.test(fractal))throw Error('Review the fractal imports before bundling.');
const html=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const built=read('browser.html').replace('/*U_SOURCE_TEXT*/',()=>html(source)).replace('/*U_LICENSE_TEXT*/',()=>html(read('LICENSE')))
 .replace('/*U_FISH_SOURCE_TEXT*/',()=>html(fishSource))
 .replace('/*U_FRACTAL_SOURCE_TEXT*/',()=>html(fractalSource))
 .replace('/*U_LOGIC*/',()=>logic).replace('/*U_PROTOCOL*/',()=>protocol).replace('/*U_FISH*/',()=>fish).replace('/*U_FRACTAL*/',()=>fractal);
const targets=[[new URL('run.html',import.meta.url),built]];
if(site){
 // Only an existing U entry can be updated. Keep its explicit site opt-in.
 const target=resolve(site,'nav/u/run.html'),existing=readFileSync(target,'utf8');
 const opening=existing.match(/<html\b[^>]*>/i)?.[0];
 if(!opening||!existing.includes('<title>Run U</title>'))throw Error('The site target must already be a Run U HTML entry.');
 const marker=opening.match(/\sdata-proportion(?=[\s=>])(?:="[^"]*"|='[^']*'|=[^\s>]+)?/i)?.[0]||'';
 targets.push([target,built.replace('<html ',`<html${marker} `)]);
}
for(const [target,content] of targets){
 if(check){if(readFileSync(target,'utf8')!==content)throw Error('Browser entry is stale; rerun this command without --check.');}
 else writeFileSync(target,content);
}
if(check)console.log(`1: ${targets.length} browser ${targets.length===1?'entry contains':'entries contain'} the current logic, fish, protocol and license.`);
