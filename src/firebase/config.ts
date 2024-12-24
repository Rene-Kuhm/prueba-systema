import { initializeApp } from '@firebase/app'
import { getAuth } from '@firebase/auth'
import { getFirestore } from '@firebase/firestore'
import { getStorage } from '@firebase/storage'

// ...existing code...

// Initialize services lazily
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Export functions for lazy loading
export const getFirebaseAuth = () => import('@firebase/auth')
export const getFirebaseFirestore = () => import('@firebase/firestore')
export const getFirebaseStorage = () => import('@firebase/storage')
