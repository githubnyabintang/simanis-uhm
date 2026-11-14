import { useCallback, useEffect, useRef, useState, type SetStateAction } from 'react';
import { saveCollectionChanges, subscribeCollection, type FirestoreCollections } from './firestoreRepository';

export function useFirestoreCollection<K extends keyof FirestoreCollections>(name: K) {
  type Item = FirestoreCollections[K];
  const [items, setItems] = useState<Item[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = useRef<Item[]>([]);

  useEffect(() => {
    try {
      return subscribeCollection(name, (values) => {
        current.current = values;
        setItems(values);
        setReady(true);
      }, (err) => { setError(err.message); setReady(true); });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Koneksi Firestore gagal.');
      setReady(true);
    }
  }, [name]);

  const update = useCallback((action: SetStateAction<Item[]>) => {
    const before = current.current;
    const after = typeof action === 'function' ? action(before) : action;
    current.current = after;
    setItems(after);
    void saveCollectionChanges(name, before, after).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan ke Firestore.');
    });
  }, [name]);

  return [items, update, ready, error] as const;
}
