import 'server-only'

import { getApps, initializeApp, cert, App } from 'firebase-admin/app'
import { getFirestore, FieldValue, Firestore } from 'firebase-admin/firestore'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getStorage, Storage } from 'firebase-admin/storage'
import type { ServiceAccount } from 'firebase-admin'
import { firebaseAdminConfig } from './config'

let app: App

/**
 * FIX UTAMA:
 * cert() BUTUH ServiceAccount,
 * sedangkan env/config biasanya string-based
 */
const serviceAccount: ServiceAccount = {
  projectId: firebaseAdminConfig.project_id,
  clientEmail: firebaseAdminConfig.client_email,
  privateKey: firebaseAdminConfig.private_key?.replace(/\\n/g, '\n')
}

if (!getApps().length) {
  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: firebaseAdminConfig.project_id
  })
} else {
  app = getApps()[0]
}

const db: Firestore = getFirestore(app)
const adminAuth: Auth = getAuth(app)
const storage: Storage = getStorage(app)

/**
 * Helper increment (Firestore)
 */
const increment = FieldValue.increment

export {
  app,
  db,
  adminAuth,
  storage,
  increment
}
