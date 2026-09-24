import {createU,verifyHistory} from './u.mjs';
const u=await createU({name:'Unknown Device'});
console.log(await u.send('text','Beethoven Beethovens.'));
console.log({historyMatches:await verifyHistory(u.history()),fingerprint:u.fingerprint()});
