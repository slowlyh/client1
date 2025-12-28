import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { firebaseConfig } from './config'

// Initialize Firebase Client (for browser)
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0]

const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db }

