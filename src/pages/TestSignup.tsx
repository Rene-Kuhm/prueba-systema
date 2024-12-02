import { useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

export default function TestSignup() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  async function handleTestSignup() {
    setLoading(true)
    setResult('') // Clear previous results
    try {
      const testEmail = `test${Date.now()}@example.com`
      const testPassword = 'test123456'

      // Test user registration
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword)
      const user = userCredential.user

      if (!user) {
        throw new Error('User registration failed. No user returned.')
      }

      // Test profile creation
      await setDoc(doc(db, 'users', user.uid), {
        email: testEmail,
        full_name: 'Test User',
        role: 'technician',
        approved: false,
        createdAt: new Date().toISOString()
      })

      setResult(`✅ Success! User registered with email: ${testEmail}`)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      setResult(`❌ Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow'>
        <h2 className='text-2xl font-bold text-center text-gray-800'>
          Test Signup
        </h2>
        <button
          onClick={handleTestSignup}
          disabled={loading}
          className='w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50'
        >
          {loading ? 'Testing...' : 'Test Signup'}
        </button>
        {result && (
          <div
            className={`mt-4 p-4 rounded ${
              result.startsWith('✅')
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            <p>{result}</p>
          </div>
        )}
      </div>
    </div>
  )
}