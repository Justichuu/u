import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {mkdtempSync, readdirSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {u,not,and,or} from '../u.js';
const root=fileURLToPath(new URL('..',import.meta.url));
test('invalid values never acquire a known truth state',()=>{
 for(const value of [undefined,null,'','other',1,0,true,{},[]]){
  assert.throws(()=>not(value));
  for(const valid of ['1','0','u'])for(const fn of [and,or]){
   assert.throws(()=>fn(value,valid));assert.throws(()=>fn(valid,value));
  }
 }
 for(const why of [undefined,null,'','  ',false,1,{}])assert.throws(()=>u(why));
 assert.equal(u('Take the named observation'),'u');
});
test('a missing port is U in the aggregate and cannot exit as passed',()=>{
 const p=spawnSync(process.execPath,['verify.mjs'],{cwd:root,encoding:'utf8',env:{...process.env,U_PYTHON:'u-deliberately-missing-runtime',U_SHELL:'u-deliberately-missing-runtime'}});
 assert.equal(p.status,2,'a missing runtime must not exit as passed');
 assert.match(p.stdout,/1 of 3 runtimes measured, 2 u/);
 assert.match(p.stdout,/nothing failed, and not everything was looked at/);
 assert.doesNotMatch(p.stdout,/the device is itself/);
});
test('the finite table survives the actual burn transformation',()=>{
 const p=spawnSync(process.execPath,['burn.mjs'],{cwd:root,encoding:'utf8'});
 assert.equal(p.status,0,p.stderr);
 assert.match(p.stdout,/tape it still prints\s+01u10u000u0u11110u1uu1/);
 assert.match(p.stdout,/words naming an owner left in it\s+0/);
 assert.doesNotMatch(p.stdout,/expected 1, 0 q3 u/,'the rename must not reach inside a string');
});
test('an installed runtime that exits with an error is a failure',()=>{
 const p=spawnSync(process.execPath,[join(root,'verify.mjs')],{cwd:tmpdir(),encoding:'utf8',env:{...process.env,U_PYTHON:process.execPath,U_SHELL:'u-deliberately-missing-runtime'}});
 assert.equal(p.status,1,'Node cannot execute Python; this is a witnessed failure, not unavailable');
 assert.match(p.stdout,/1\s+u.js\s+node/,'the checker resolves ports from its own directory');
 assert.match(p.stdout,/0\s+u.py\s+python\s+runtime failed/);
 assert.match(p.stdout,/u\s+u.sh/);
});
test('burn runs from another directory and removes only its own temporary files',()=>{
 const scratch=mkdtempSync(join(tmpdir(),'u-burn-check-'));
 try {
  const p=spawnSync(process.execPath,[join(root,'burn.mjs')],{cwd:scratch,encoding:'utf8',env:{...process.env,TEMP:scratch,TMP:scratch,TMPDIR:scratch}});
  assert.equal(p.status,0,p.stderr);
  assert.deepEqual(readdirSync(scratch),[],'temporary transformed source must be cleaned up');
  assert.match(p.stdout,/Authorship is not established/);
 } finally {rmSync(scratch,{recursive:true,force:true});}
});
