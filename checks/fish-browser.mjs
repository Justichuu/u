// Run after npm run build. Supply PLAYWRIGHT_MODULE when Playwright is elsewhere.
// Optional: BROWSERS=chromium,firefox,webkit and FISH_SCREENSHOTS=/path/to/output.
import assert from 'node:assert/strict';
import {mkdir,mkdtemp,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
const moduleName=process.env.PLAYWRIGHT_MODULE;
const playwright=await import(moduleName?pathToFileURL(resolve(moduleName)).href:'playwright');
const file=new URL('../run.html',import.meta.url).href;
const output=process.env.FISH_SCREENSHOTS;
if(output)await mkdir(output,{recursive:true});
for(const name of (process.env.BROWSERS||'chromium').split(',')){
 const browser=await playwright[name].launch({headless:true});
 const temporary=await mkdtemp(join(tmpdir(),'u-fish-'));
 try{
  const page=await browser.newPage({viewport:{width:980,height:1100},reducedMotion:'reduce'});
  const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
  await page.goto(file);await page.locator('#fish-swim').waitFor();
  const state=()=>page.locator('#fish-state').textContent();
  const click=id=>page.locator('#fish-'+id).click();
  assert.match(await state(),/^0 · progress 0/);
  assert.equal(await page.locator('#fish-depth').inputValue(),'3');
  assert.equal(await page.locator('#fish-copies use').count(),14);
  assert.match(await page.locator('#fish-recursion').textContent(),/15 fish.*finite preview/);
  const originalState=await state();
  if(output)await page.locator('#fish-graph').screenshot({path:resolve(output,`u-fish-${name}-fractal-3.png`)});
  await page.locator('#fish-depth').focus();await page.keyboard.press('End');
  assert.equal(await page.locator('#fish-copies use').count(),126);
  assert.match(await page.locator('#fish-recursion').textContent(),/127 fish/);
  assert.equal(await state(),originalState);
  if(output)await page.locator('#fish-graph').screenshot({path:resolve(output,`u-fish-${name}-fractal-6.png`)});
  await page.keyboard.press('Home');
  assert.equal(await page.locator('#fish-copies use').count(),0);
  assert.match(await page.locator('#fish-recursion').textContent(),/Depth 0: 1 fish/);
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#fish-copies use').count(),2);
  assert.equal(await state(),originalState);
  assert.equal(await page.locator('#fish-paths path').count(),4);
  assert.equal(await page.locator('#fish-paths .fish-tail').count(),2);
  assert.equal(await page.locator('#fish-angle').inputValue(),'3');
  assert.equal(await page.locator('#fish-phase').inputValue(),'0.05');
  assert.equal(await page.locator('#fish-pace').inputValue(),'1.05');
  assert.match(await page.locator('#fish-intersection').textContent(),/Approximate second intersection/);
  await click('crossing');const defaultZero=await state();await click('not');
  assert.match(await state(),/^1 · progress 1/);assert.notEqual((await state()).split(': (')[1],defaultZero.split(': (')[1]);
  await click('not');assert.equal(await state(),defaultZero);
  // The symmetric reference alone places both branch identities at progress 1.
  await click('symmetric');
  await click('crossing');assert.match(await state(),/^0 · progress 1 · 0: \(1, 0\)/);
  await click('not');assert.match(await state(),/^1 · progress 1 · 1: \(1, 0\)/);
  await click('not');assert.match(await state(),/^0 · progress 1/);
  await page.locator('#fish-value').selectOption('u');
  await page.locator('#fish-reason').fill('');await click('carry');
  assert.equal(await page.locator('#fish-error').isVisible(),true);assert.match(await state(),/^0 · progress 1/);
  await page.locator('#fish-reason').fill('Observe the selected branch.');await click('carry');
  assert.match(await state(),/^u · progress 1/);assert.match(await state(),/Candidate 0: \(1, 0\); Candidate 1: \(1, 0\)/);
  assert.deepEqual(await page.locator('#fish-markers [data-value]').evaluateAll(nodes=>nodes.map(n=>n.dataset.value)),['0','1']);
  await click('not');assert.match(await state(),/^u · progress 1/);assert.match(await state(),/Observe the selected branch\./);
  if(output)await page.locator('section:has(#fish-title)').screenshot({path:resolve(output,`u-fish-${name}-cycloid-crossing.png`)});
  await page.locator('#fish-distance').fill('0.3');await click('swim');assert.match(await state(),/^u · progress 1.3/);
  await page.locator('#fish-distance').fill('0.05');await click('swim');assert.match(await state(),/^u · progress 1.35/);
  assert.match(await state(),/Beyond the displayed window/);assert.equal(await page.locator('#fish-markers [data-value]').count(),0);
  const before=await state();await page.locator('#fish-distance').fill('-1');await click('swim');assert.equal(await state(),before);
  await page.locator('#fish-distance').fill('');await click('swim');assert.equal(await state(),before);
  await click('restart');assert.match(await state(),/^u · progress 0/);assert.match(await state(),/Observe the selected branch\./);
  await page.locator('#fish-value').selectOption('1');await click('carry');await page.locator('#fish-distance').fill('1.1');await click('swim');
  assert.match(await state(),/^1 · progress 1.1/);assert.equal(await page.locator('#fish-markers rect').count(),1);
  const branch=()=>page.locator('#fish-paths [data-value="1"]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d')).join(''));
  let prior=await branch();
  let copyBefore=await page.locator('#fish-copies use[data-address="1"]').getAttribute('transform');
  for(const [control,value] of [['angle','7'],['phase','0.09'],['pace','0.9']]){
   await page.locator('#fish-'+control).fill(value);await click('geometry');
   assert.equal(await page.locator('#fish-error').isVisible(),false);assert.notEqual(await branch(),prior);
   assert.match(await state(),/^1 · progress 1.1/);prior=await branch();
   const copyAfter=await page.locator('#fish-copies use[data-address="1"]').getAttribute('transform');
   assert.notEqual(copyAfter,copyBefore);copyBefore=copyAfter;
  }
  await page.locator('#fish-pace').fill('0');await click('geometry');
  assert.equal(await page.locator('#fish-error').isVisible(),true);assert.equal(await branch(),prior);
  for(const [id,value] of [['angle','180'],['phase','0'],['pace','1']])await page.locator('#fish-'+id).fill(value);
  await click('geometry');assert.match(await page.locator('#fish-intersection').textContent(),/No second intersection found/);
  assert.equal(await page.locator('#fish-paths .fish-tail').count(),0);
  for(const [id,value] of [['angle','3'],['phase','0.05'],['pace','1.05']])await page.locator('#fish-'+id).fill(value);
  await click('geometry');assert.equal(await page.locator('#fish-error').isVisible(),false);
  // Exercise the existing finite table through its real UI after the new code ran.
  await page.locator('details:has(#check) summary').click();await page.locator('#check').click();
  assert.match(await page.locator('#checks').textContent(),/22 of 22/);
  assert.match(await page.locator('#fish-source').textContent(),/export const swim/);
  for(const width of [980,320]){
   await page.setViewportSize({width,height:1100});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${name}: overflow at ${width}px`);
   if(output)await page.locator('section:has(#fish-title)').screenshot({path:resolve(output,`u-fish-${name}-cycloid-${width}.png`)});
  }
  await page.locator('#fish-value').selectOption('u');await page.locator('#fish-reason').fill('Observation'.repeat(50));await click('carry');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${name}: long unsettled reason overflows`);
  // The downloaded file must run the same shared fish code offline.
  const downloadPromise=page.waitForEvent('download');await page.locator('#download').click();const download=await downloadPromise;
  const downloaded=join(temporary,'Run-U.html');await download.saveAs(downloaded);
  const offline=await browser.newPage();await offline.goto(pathToFileURL(downloaded).href);
  assert.equal(await offline.locator('#fish-copies use').count(),14);
  await offline.locator('#fish-crossing').click();assert.match(await offline.locator('#fish-state').textContent(),/^0 · progress 1/);
  await offline.close();assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  console.log(`1: ${name} fractal keyboard depth0/1/3/6, phase propagation, cycloid controls, state preservation, finite tape, 320/980px and offline download.`);
 }finally{await browser.close();await rm(temporary,{recursive:true,force:true});}
}
