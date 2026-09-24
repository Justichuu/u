// A self-contained browser file, built from the same modules as the runtime checks.
import {readFileSync,writeFileSync} from 'node:fs';
const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');
const source=read('u.js');
const logic=source.slice(0,source.indexOf('\nif (process.argv[1]')).replace(/^import .*$/m,'').replace(/^export /gm,'');
if(!logic.includes('const KNOWN')||logic.includes('node:url'))throw Error('Review the logic entry point before bundling.');
const protocol=read('u.mjs').replace(/^export /gm,'');
const html=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const built=read('browser.html').replace('/*U_SOURCE_TEXT*/',()=>html(source)).replace('/*U_LICENSE_TEXT*/',()=>html(read('LICENSE')))
 .replace('/*U_LOGIC*/',()=>logic).replace('/*U_PROTOCOL*/',()=>protocol);
if(process.argv.includes('--check')){
 if(read('run.html')!==built)throw Error('Run node build-browser.mjs to refresh the browser download.');
 console.log('1: the browser file contains the current logic, protocol and license.');
}else writeFileSync(new URL('run.html',import.meta.url),built);
