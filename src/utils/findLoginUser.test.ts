import test from 'node:test';
import assert from 'node:assert/strict';
import { findLoginUser } from './findLoginUser';
import type { User } from '../types';

const lecturer: User = { id: 'd', name: 'Dosen', username: 'dosen01', email: 'd@example.com', role: 'dosen', isActive: true, nidn: '9900000001', createdAt: '' };
const student: User = { id: 'm', name: 'Mahasiswa', username: '9900000001', email: 'm@example.com', role: 'mahasiswa', isActive: true, npm: '9900000001', createdAt: '' };

test('username mahasiswa diprioritaskan meskipun sama dengan NIDN dosen', () => {
  assert.equal(findLoginUser([lecturer, student], '9900000001').user?.role, 'mahasiswa');
  assert.equal(findLoginUser([student, lecturer], '  DOSEN01  ').user?.role, 'dosen');
});

test('identitas yang ambigu ditolak dan email tetap dikenali', () => {
  const other = { ...student, id: 'm2', username: 'lain', email: 'lain@example.com', npm: '999' };
  const another = { ...lecturer, nidn: '999' };
  assert.equal(findLoginUser([other, another], '999').ambiguous, true);
  assert.equal(findLoginUser([other, lecturer], 'M@EXAMPLE.COM').ambiguous, false);
  assert.equal(findLoginUser([student, lecturer], 'M@EXAMPLE.COM').user?.id, 'm');
});
