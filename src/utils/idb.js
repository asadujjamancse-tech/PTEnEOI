// Minimal IndexedDB helper for storing blobs and metadata.
const DB_NAME = 'pte_practice_v1';
const DB_VERSION = 2;
const STORE_RECORDINGS = 'recordings';
const STORE_RESOURCES  = 'task_resources';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_RECORDINGS)) db.createObjectStore(STORE_RECORDINGS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_RESOURCES))  db.createObjectStore(STORE_RESOURCES,  { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror  = () => reject(req.error);
  });
}

export async function saveRecording({ id, blob, metadata = {} }) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECORDINGS, 'readwrite');
    const item = { id, blob, metadata, created: new Date().toISOString() };
    const r = tx.objectStore(STORE_RECORDINGS).put(item);
    r.onsuccess = () => resolve(item);
    r.onerror   = () => reject(r.error);
  });
}

export async function getRecording(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECORDINGS, 'readonly');
    const r = tx.objectStore(STORE_RECORDINGS).get(id);
    r.onsuccess = () => resolve(r.result);
    r.onerror   = () => reject(r.error);
  });
}

export async function listRecordings() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECORDINGS, 'readonly');
    const items = [];
    tx.objectStore(STORE_RECORDINGS).openCursor().onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) { items.push(cursor.value); cursor.continue(); } else resolve(items);
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveResource({ id, blob, metadata = {} }) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RESOURCES, 'readwrite');
    const item = { id, blob, metadata };
    tx.objectStore(STORE_RESOURCES).put(item).onsuccess = () => resolve(item);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getResourcesByTask(taskId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RESOURCES, 'readonly');
    const items = [];
    tx.objectStore(STORE_RESOURCES).openCursor().onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        if (cursor.value?.metadata?.taskId === taskId) items.push(cursor.value);
        cursor.continue();
      } else resolve(items);
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteResource(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RESOURCES, 'readwrite');
    tx.objectStore(STORE_RESOURCES).delete(id).onsuccess = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export default { saveRecording, getRecording, listRecordings, saveResource, getResourcesByTask, deleteResource };
