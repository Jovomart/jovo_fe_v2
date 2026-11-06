import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBozg_M_L3l4-h-sg09RI0xGPlKN4LRMd0',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'jovomart.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'jovomart',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'jovomart.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '736786060474',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:736786060474:web:681b126c9139da0f07de83',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-2TBH6X3GC3',
}

let app: any = null
let auth: any = null
let googleProvider: any = null

try {
  const hasKey = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'placeholder'
  if (hasKey) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig)
    auth = getAuth(app)
    googleProvider = new GoogleAuthProvider()
  } else {
    console.warn('⚠️ Firebase not configured - Google Sign-In disabled. Set NEXT_PUBLIC_FIREBASE_* in .env.local')
  }
} catch (err: any) {
  console.warn('⚠️ Firebase init failed:', err.message)
}

export { auth, googleProvider }
export default app
