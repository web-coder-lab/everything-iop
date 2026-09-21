import { AppError } from '../../core/errors.js';
import { env } from '../../config/env.js';

let initialized = false;
let firestoreInstance: any = null;
let storageInstance: any = null;

async function ensure() {
  if (initialized) return;
  if (!env.firebaseProjectId || !env.firebaseClientEmail || !env.firebasePrivateKey) {
    throw new AppError(503, 'FIREBASE_NOT_CONFIGURED', 'Firebase integration is not configured yet.');
  }
  const admin = await import('firebase-admin');
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebaseProjectId,
        clientEmail: env.firebaseClientEmail,
        privateKey: env.firebasePrivateKey,
      }),
      storageBucket: env.firebaseStorageBucket || undefined,
    });
  }
  firestoreInstance = admin.getFirestore();
  storageInstance = admin.getStorage();
  initialized = true;
}

export async function firebaseFirestore() {
  await ensure();
  return firestoreInstance;
}

export async function firebaseStorage() {
  await ensure();
  return storageInstance;
}
