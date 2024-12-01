import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: 'AIzaSyDTG1v3T8sDQGRD3nhWOieLP8CVnKijfiM',
    authDomain: 'cospecreclamos.firebaseapp.com',
    projectId: 'cospecreclamos',
    storageBucket: 'cospecreclamos.firebasestorage.app',
    messagingSenderId: '838077251670',
    appId: '1:838077251670:web:4f9f50feaaa158bdc77bf7',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
