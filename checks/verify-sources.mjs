import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const lines=readFileSync(new URL('SHA256SUMS.txt',root),'utf8').trim().split(/\r?\n/);
for(const line of lines){
 const [,expected,name]=line.match(/^([a-f0-9]{64})  (.+)$/)||[];
 if(!name||name.startsWith('/')||name.split('/').includes('..'))throw Error('Invalid checksum entry');
 if(createHash('sha256').update(readFileSync(new URL(name,root))).digest('hex')!==expected)throw Error('Source differs: '+name);
}
console.log(JSON.stringify({passed:true,files:lines.length,scope:'Listed release bytes only'}));
