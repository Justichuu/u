import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const lines=readFileSync(new URL('SHA256SUMS.txt',root),'utf8').trim().split(/\r?\n/);
for(const line of lines){
 const [,expected,name]=line.match(/^([a-f0-9]{64})  (.+)$/)||[];
 if(!name||name.startsWith('/')||name.split('/').includes('..'))throw Error('Invalid checksum entry');
 if(createHash('sha256').update(readFileSync(new URL(name,root))).digest('hex')!==expected)throw Error('Source differs: '+name);
}
// What this does and does not establish, said here because "passed: true" reads
// as more than it is. The manifest was generated FROM these files, so checking
// the files against it is a closed loop: each layer vouched for by the one
// below, with nothing underneath. It proves the bytes have not changed since
// somebody wrote the manifest. It proves nothing at all about whether the code
// is correct, whether the manifest was honest when written, or whether the
// files and the manifest were altered together. Those need a witness from
// outside this repository, and there is not one here.
console.log(JSON.stringify({
  unchangedSinceManifest: true,
  files: lines.length,
  scope: 'Listed release bytes only',
  establishes: 'these bytes match the manifest in this repository',
  doesNotEstablish: 'correctness, or that the manifest was honest when written; ' +
    'the manifest is generated from these same files, so this loop has no ground under it',
  correctness: 'u',
}));
