import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, increment } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'
import { firebaseAdminConfig } from './config'

// Initialize Firebase Admin
const app = getApps().length === 0
  ? initializeApp({
      credential: cert(firebaseAdminConfig),
      projectId: firebaseAdminConfig.project_id
    })
  : getApps()[0]

const db = getFirestore(app)
const adminAuth = getAuth(app)
const storage = getStorage(app)

export { app, db, adminAuth, storage, increment }
