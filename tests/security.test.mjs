import test from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { openDB } from 'idb';
import { saveSessionToDB, getSessionFromDB, deleteSessionFromDB } from '../src/utils/trackingDB.js';
import { requestLogout } from '../src/utils/logout.mjs';

const points = [{lat: 0, lon: 0}];
test('tracking drafts remain scoped to their owner; deletion cannot delete another account', async () => {
  await saveSessionToDB({points, status:'paused'}, 'account-a');
  assert.equal(await getSessionFromDB('account-b'), null);
  await saveSessionToDB({points:[], status:'stopped'}, 'account-b');
  assert.deepEqual((await getSessionFromDB('account-a')).points, points);
  await deleteSessionFromDB('account-b');
  assert.equal(await getSessionFromDB('account-b'), null);
  assert.deepEqual((await getSessionFromDB('account-a')).points, points);
});
test('anonymous reads cannot restore tracking data, and writes require an owner', async () => {
  assert.equal(await getSessionFromDB(), null);
  await assert.rejects(saveSessionToDB({points}), /Could not save/);
});
test('legacy unowned session is not assigned to the next login and is preserved', async () => {
  const db = await openDB('trackingDB',1);
  await db.put('currentTrack', {points, status:'paused'}, 'activeSession');
  assert.equal(await getSessionFromDB('new-account'), null);
  assert.deepEqual((await db.get('currentTrack','activeSession')).points, points);
  db.close();
});
test('logout posts credentials and CSRF then succeeds only on HTTP success', async () => {
  let call;
  await requestLogout({apiUrl:'http://localhost:5001/api', csrfToken:'test-only-token', fetchImpl:async (...args) => {call=args; return {ok:true};}});
  assert.equal(call[0], 'http://localhost:5001/api/auth/logout');
  assert.equal(call[1].credentials, 'include');
  assert.equal(call[1].headers['X-CSRF-Token'], 'test-only-token');
});
for (const status of [401,403,500]) test(`logout rejects HTTP ${status} rather than clearing authentication`, async () => {
  await assert.rejects(requestLogout({apiUrl:'http://localhost', fetchImpl:async () => ({ok:false,status})}), /session may still be active/);
});
test('logout rejects a network failure', async () => {
  await assert.rejects(requestLogout({apiUrl:'http://localhost', fetchImpl:async () => {throw new Error('offline');}}), /Check your connection/);
});

const { apiPhotoImageProps } = await import('../src/utils/mediaPolicy.mjs');
test('private API photo rendering bypasses shared optimizer and sends browser credentials', () => {
  assert.deepEqual(apiPhotoImageProps('http://localhost:5001/api/photos/123', 'http://localhost:5001/api'), {unoptimized:true,crossOrigin:'use-credentials'});
  assert.deepEqual(apiPhotoImageProps('http://localhost:5001/api/photos/123', 'http://localhost:5001/api/'), {unoptimized:true,crossOrigin:'use-credentials'});
});
test('media credentials policy does not apply to unrelated hosts or static images', () => {
  assert.deepEqual(apiPhotoImageProps('https://other.invalid/api/photos/123','http://localhost:5001/api'), {});
  assert.deepEqual(apiPhotoImageProps('/default-avatar.png','http://localhost:5001/api'), {});
  assert.deepEqual(apiPhotoImageProps('http://localhost:5001/api/photos/123',undefined), {});
});

const { publicUserProfile } = await import('../src/utils/publicUserProfile.mjs');
test('browser user state excludes bearer and future credential fields', () => {
  const data = {_id:'fixture', username:'Fixture', token:'fixture-bearer', refreshToken:'fixture-refresh', password:'fixture-password'};
  assert.deepEqual(publicUserProfile(data), {_id:'fixture', username:'Fixture'});
  assert.equal(publicUserProfile(null), null);
});
test('browser authentication never persists login responses or trusts a legacy cache', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('../src/context/AuthContext.js', import.meta.url), 'utf8');
  assert(!source.includes('localStorage.setItem'));
  assert(!source.includes('localStorage.getItem'));
  assert(source.includes('localStorage.removeItem("userData")'));
});
