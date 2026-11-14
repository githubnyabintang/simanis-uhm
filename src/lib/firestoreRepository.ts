import { collection, deleteDoc, doc, onSnapshot, setDoc, writeBatch, type Unsubscribe } from 'firebase/firestore';
import { firestore } from './firebase';
import type { User, ProgramStudi, Semester, Kelas, MataKuliah, PenawaranMataKuliah, Mahasiswa, PesertaMataKuliah, BobotNilai, NilaiMahasiswa, RiwayatVerifikasi } from '../types';

export interface FirestoreCollections {
  users: User;
  programStudi: ProgramStudi;
  semesters: Semester;
  classes: Kelas;
  courses: MataKuliah;
  offerings: PenawaranMataKuliah;
  students: Mahasiswa;
  enrollments: PesertaMataKuliah;
  weights: BobotNilai;
  grades: NilaiMahasiswa;
  verificationHistory: RiwayatVerifikasi;
}

function database() {
  if (!firestore) throw new Error('Konfigurasi Firebase belum lengkap.');
  return firestore;
}

export function subscribeCollection<K extends keyof FirestoreCollections>(
  name: K,
  onData: (items: FirestoreCollections[K][]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(collection(database(), name), (snapshot) => {
    onData(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as FirestoreCollections[K]));
  }, onError);
}

export async function saveDocument<K extends keyof FirestoreCollections>(name: K, value: FirestoreCollections[K]): Promise<void> {
  // Firestore rejects undefined fields; optional values are omitted.
  const data = JSON.parse(JSON.stringify(value));
  await setDoc(doc(database(), name, value.id), data);
}

export async function removeDocument<K extends keyof FirestoreCollections>(name: K, id: string): Promise<void> {
  await deleteDoc(doc(database(), name, id));
}

export async function saveCollectionChanges<K extends keyof FirestoreCollections>(name: K, before: FirestoreCollections[K][], after: FirestoreCollections[K][]): Promise<void> {
  const db = database();
  const batch = writeBatch(db);
  const previous = new Map(before.map((item) => [item.id, JSON.stringify(item)]));
  const nextIds = new Set(after.map((item) => item.id));
  for (const item of after) {
    if (previous.get(item.id) !== JSON.stringify(item)) batch.set(doc(db, name, item.id), JSON.parse(JSON.stringify(item)));
  }
  for (const item of before) {
    if (!nextIds.has(item.id)) batch.delete(doc(db, name, item.id));
  }
  await batch.commit();
}
