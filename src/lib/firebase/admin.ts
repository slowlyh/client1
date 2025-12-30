import 'server-only'

import { getApps, initializeApp, cert, App } from 'firebase-admin/app'
import { getFirestore, FieldValue, Firestore } from 'firebase-admin/firestore'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getStorage, Storage } from 'firebase-admin/storage'
import { firebaseAdminConfig } from './config'

let app: App

if (!getApps().length) {
  app = initializeApp({
    credential: cert(firebaseAdminConfig),
    projectId: firebaseAdminConfig.project_id
  })
} else {
  app = getApps()[0]
}

const db: Firestore = getFirestore(app)
const adminAuth: Auth = getAuth(app)
const storage: Storage = getStorage(app)

/**
 * Export helper increment (wrapper)
 * supaya pemakaian tetap simple
 */
const increment = FieldValue.increment

export {
  app,
  db,
  adminAuth,
  storage,
  increment
}
